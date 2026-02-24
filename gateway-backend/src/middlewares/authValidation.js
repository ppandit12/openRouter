const axios = require('axios');

const PRIMARY_BACKEND_URL = process.env.PRIMARY_BACKEND_URL || 'http://localhost:5000';
const INTERNAL_SECRET = process.env.INTERNAL_SECRET || 'dev-internal-secret';

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const apiKey = authHeader.split(' ')[1];

  try {
    const response = await axios.post(`${PRIMARY_BACKEND_URL}/api/internal/validate-key`, {
      api_key: apiKey
    }, {
      headers: {
        'x-internal-secret': INTERNAL_SECRET
      }
    });

    if (response.data.valid) {
      req.userAuth = {
        user_id: response.data.user_id,
        credits: response.data.credits
      };
      next();
    } else {
      res.status(401).json({ error: 'Invalid API key' });
    }
  } catch (err) {
    if (err.response && err.response.status === 402) {
      return res.status(402).json({ error: 'Insufficient credits', user_id: err.response.data.user_id });
    }
    console.error('Auth validation error:', err.message);
    res.status(401).json({ error: 'Invalid API key or unauthorized' });
  }
};
