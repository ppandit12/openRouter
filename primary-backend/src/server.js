require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// We need raw body matching signature for Stripe webhook
const billingController = require('./controllers/billingController');
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), billingController.stripeWebhook);

// For all other routes, use JSON parser
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/keys', require('./routes/apiKeyRoutes'));
app.use('/api/internal', require('./routes/internalRoutes'));
app.use('/api/billing', require('./routes/billingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Primary Backend started on port ${PORT}`));
