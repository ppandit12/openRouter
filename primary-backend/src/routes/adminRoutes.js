const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/auth'); // Require auth, optionally add a isAdmin middleware

router.get('/stats', auth, adminController.getStats);

module.exports = router;
