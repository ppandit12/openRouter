const axios = require('axios');
const providerService = require('../services/providerService');
const PRIMARY_BACKEND_URL = process.env.PRIMARY_BACKEND_URL || 'http://localhost:5000';
const INTERNAL_SECRET = process.env.INTERNAL_SECRET || 'dev-internal-secret';

exports.chatCompletions = async (req, res) => {
  try {
    const { model, messages, ...parameters } = req.body;
    let result = null;

    if (!model) return res.status(400).json({ error: 'Model is required' });

    // Simple routing logic based on model prefix
    if (model.startsWith('gpt-')) {
      result = await providerService.callOpenAI(model, messages, parameters);
    } else if (model.startsWith('claude-')) {
      result = await providerService.callAnthropic(model, messages, parameters);
    } else if (model.includes('gemini')) {
      result = await providerService.callGemini(model, messages, parameters);
    } else {
      return res.status(400).json({ error: `Model [${model}] not supported` });
    }

    // Attempt to log usage to Primary Backend asynchronously
    // In production, might want queueing (e.g., RabbitMQ, Redis queue) for resilience
    axios.post(`${PRIMARY_BACKEND_URL}/api/internal/log-usage`, {
        user_id: req.userAuth.user_id,
        provider: result.provider,
        model: model,
        input_tokens: result.input_tokens,
        output_tokens: result.output_tokens
     }, {
       headers: { 'x-internal-secret': INTERNAL_SECRET }
     }).catch(err => {
        console.error('Failed to log usage to primary DB:', err.message);
     });

    // Format the response to exactly match OpenAI
    const openAICompatibleResponse = {
      id: `chatcmpl-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: result.text
        },
        finish_reason: 'stop'
      }],
      usage: {
        prompt_tokens: result.input_tokens,
        completion_tokens: result.output_tokens,
        total_tokens: result.input_tokens + result.output_tokens
      }
    };

    res.json(openAICompatibleResponse);
  } catch (error) {
    console.error('Provider error:', error.message || error);
    res.status(500).json({ error: 'Failed to process chat completion', details: error.message || String(error) });
  }
};

exports.getModels = (req, res) => {
    // Return sample list of models mimicking OpenAI
    res.json({
        object: "list",
        data: [
            { id: "gpt-4o", object: "model", created: 1709257200, owned_by: "openai" },
            { id: "claude-3-opus-20240229", object: "model", created: 1709257200, owned_by: "anthropic" },
            { id: "gemini-1.5-pro", object: "model", created: 1709257200, owned_by: "google" },
        ]
    });
};
