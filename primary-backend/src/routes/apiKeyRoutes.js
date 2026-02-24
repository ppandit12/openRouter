const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apiKeyController');
const auth = require('../middlewares/auth');

router.post('/', auth, apiKeyController.generateKey);
router.get('/', auth, apiKeyController.getKeys);
router.delete('/:id', auth, apiKeyController.deleteKey);

module.exports = router;
