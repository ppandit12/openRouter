const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const auth = require('../middlewares/auth');

router.post('/create-checkout-session', auth, billingController.createCheckoutSession);
// Webhook needs raw body, we'll mount it specially in server.js
// router.post('/webhook', express.raw({type: 'application/json'}), billingController.stripeWebhook);

module.exports = router;
