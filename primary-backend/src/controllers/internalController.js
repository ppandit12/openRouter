const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/User');
const ApiKey = require('../models/ApiKey');
const UsageLog = require('../models/UsageLog');
const ModelPricing = require('../models/ModelPricing');

// In production, internal requests should be protected via mutual TLS or a strong internal secret
const INTERNAL_SECRET = process.env.INTERNAL_SECRET || 'dev-internal-secret';

const checkInternalAuth = (req) => {
  return req.headers['x-internal-secret'] === INTERNAL_SECRET;
}

exports.validateKey = async (req, res) => {
  if (!checkInternalAuth(req)) return res.status(401).json({ error: 'Unauthorized internal call' });
  
  try {
    const { api_key } = req.body;
    
    // To validate, we need to match the raw key with the bcrypt hash in the DB.
    // Since we don't know the user, we have to find it. This can be slow O(N).
    // Better approach: prefix keys with user_id or random ID to lookup first.
    // For now, let's assume we fetch all keys and compare.
    // OPTIMIZATION: A real system would use a prefix or Redis mapping.
    // Let's optimize: We'll implement a Redis cache in the Gateway later.
    // Here, we'll iterate over keys (which is bad for production).
    // Let's change the key generation strategy in apiKeyController to include a prefix if needed,
    // Or just store the first 8 chars unhashed for lookup?
    // Let's implement robust lookup later, for now we will iterate.
    
    const allKeys = await ApiKey.find({});
    let matchedKey = null;
    
    for (let k of allKeys) {
      if (await bcrypt.compare(api_key, k.api_key_hash)) {
        matchedKey = k;
        break;
      }
    }
    
    if (!matchedKey) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    const user = await User.findById(matchedKey.user_id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    if (user.credits <= 0) {
      return res.status(402).json({ error: 'Insufficient credits', user_id: user._id });
    }
    
    res.json({ valid: true, user_id: user._id, credits: user.credits });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.logUsage = async (req, res) => {
  if (!checkInternalAuth(req)) return res.status(401).json({ error: 'Unauthorized internal call' });
  
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { user_id, provider, model, input_tokens, output_tokens } = req.body;
    
    // Get pricing
    let pricing = await ModelPricing.findOne({ model, provider }).session(session);
    if (!pricing) {
        // Fallback default pricing if not found
        pricing = { input_price_per_1k_tokens: 0.01, output_price_per_1k_tokens: 0.03 };
    }
    
    const input_cost = (input_tokens / 1000) * pricing.input_price_per_1k_tokens;
    const output_cost = (output_tokens / 1000) * pricing.output_price_per_1k_tokens;
    const total_cost = input_cost + output_cost;
    const total_tokens = input_tokens + output_tokens;
    
    const user = await User.findById(user_id).session(session);
    if (!user) {
        throw new Error('User not found');
    }
    
    user.credits -= total_cost;
    await user.save({ session });
    
    const log = new UsageLog({
        user_id,
        provider,
        model,
        input_tokens,
        output_tokens,
        total_tokens,
        input_cost,
        output_cost,
        total_cost,
        status: 'success'
    });
    
    await log.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    res.json({ success: true, new_balance: user.credits });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).json({ error: 'Transaction failed' });
  }
};
