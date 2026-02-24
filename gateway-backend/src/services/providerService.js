// Since you mentioned proxying for multiple models, we can use their SDKs or direct fetch/axios
// to their APIs to normalize the format.

const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/genai');
const Anthropic = require('@anthropic-ai/sdk');

// In production, keep these initialized
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// Note: Google uses @google/genai new SDK
// const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

exports.callOpenAI = async (model, messages, parameters) => {
  const response = await openai.chat.completions.create({
    model: model,
    messages: messages,
    ...parameters
  });
  
  return {
    provider: 'openai',
    text: response.choices[0].message.content,
    input_tokens: response.usage.prompt_tokens,
    output_tokens: response.usage.completion_tokens,
    raw_response: response // For pass-through
  };
};

exports.callAnthropic = async (model, messages, parameters) => {
  // Convert OpenAI style messages to Anthropic style
  const systemMsg = messages.find(m => m.role === 'system')?.content;
  const anthropicMessages = messages.filter(m => m.role !== 'system').map(m => ({
    role: m.role,
    content: m.content
  }));

  const response = await anthropic.messages.create({
    model: model,
    max_tokens: parameters.max_tokens || 1024,
    system: systemMsg,
    messages: anthropicMessages,
    temperature: parameters.temperature
  });

  return {
    provider: 'claude',
    text: response.content[0].text,
    input_tokens: response.usage.input_tokens,
    output_tokens: response.usage.output_tokens,
    raw_response: response
  };
};

exports.callGemini = async (model, messages, parameters) => {
  // Note: For simplicity, we assume an axios call or using the genai sdk if initialized.
  // Using direct fetch here as genai SDK requires specific setups per API version.
  const axios = require('axios');
  
  const formattedMessages = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user', // Basic mapping
    parts: [{ text: m.content }]
  }));

  const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    contents: formattedMessages
  });

  const data = response.data;
  
  // Basic token estimation if Google API doesn't return usageMetadata 
  // But usually it's in data.usageMetadata
  const usage = data.usageMetadata || {};

  return {
    provider: 'gemini',
    text: data.candidates[0].content.parts[0].text,
    input_tokens: usage.promptTokenCount || Math.ceil(JSON.stringify(messages).length / 4),
    output_tokens: usage.candidatesTokenCount || Math.ceil(data.candidates[0].content.parts[0].text.length / 4),
    raw_response: data
  };
};
