const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Payment = require('../models/Payment');

exports.createCheckoutSession = async (req, res) => {
  try {
    const { amount } = req.body; // Amount in USD dollars
    
    // Credits calculation: assume $1 = $1 worth of credits, handled in dollars.
    const creditsAdded = amount;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'OpenRouter Clone Credits',
            },
            unit_amount: amount * 100, // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard?payment=cancelled`,
      client_reference_id: req.user.id,
      metadata: {
        userId: req.user.id,
        credits: creditsAdded
      }
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
};

exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Note: To use req.body as buffer, we need to set express.raw() in server.js just for this route
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const creditsAdded = parseFloat(session.metadata.credits);
    
    try {
      const paymentItem = new Payment({
        user_id: userId,
        stripe_payment_id: session.id,
        amount: session.amount_total / 100, // Cents to USD
        credits_added: creditsAdded,
        status: 'completed'
      });
      await paymentItem.save();
      
      const user = await User.findById(userId);
      if (user) {
        user.credits += creditsAdded;
        await user.save();
      }
    } catch (err) {
        console.error('Failed to fulfill payment log:', err);
    }
  }

  res.json({ received: true });
};
