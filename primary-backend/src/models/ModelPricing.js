const mongoose = require('mongoose');

const modelPricingSchema = new mongoose.Schema({
  model: { type: String, required: true, unique: true },
  provider: { type: String, required: true, enum: ['openai', 'claude', 'gemini'] },
  input_price_per_1k_tokens: { type: Number, required: true },
  output_price_per_1k_tokens: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ModelPricing', modelPricingSchema);
