const express = require('express');
const router = express.Router();
const proxyController = require('../controllers/proxyController');
const authValidation = require('../middlewares/authValidation');
const rateLimiter = require('../middlewares/rateLimiter');

// All /v1 endpoints apply auth and rate limiting
router.use(authValidation);
router.use(rateLimiter);

router.post('/chat/completions', proxyController.chatCompletions);
router.get('/models', proxyController.getModels);

// Note: embeddings and images can follow exact same pattern if needed, omitted for brevity
router.post('/embeddings', (req, res) => res.status(501).json({error: 'Not Implemented Yet'}));
router.post('/images', (req, res) => res.status(501).json({error: 'Not Implemented Yet'}));

module.exports = router;
