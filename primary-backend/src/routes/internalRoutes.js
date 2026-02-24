const express = require('express');
const router = express.Router();
const internalController = require('../controllers/internalController');

// All endpoints here should be protected by internal secret
router.post('/validate-key', internalController.validateKey);
router.post('/log-usage', internalController.logUsage);

module.exports = router;
