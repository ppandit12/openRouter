const mongoose = require('mongoose');

const usageLogSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: String, required: true, enum: ['openai', 'claude', 'gemini'] },
  model: { type: String, required: true },
  input_tokens: { type: Number, required: true },
  output_tokens: { type: Number, required: true },
  total_tokens: { type: Number, required: true },
  input_cost: { type: Number, required: true },
  output_cost: { type: Number, required: true },
  total_cost: { type: Number, required: true },
  status: { type: String, enum: ['success', 'failed'], default: 'success' },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UsageLog', usageLogSchema);
