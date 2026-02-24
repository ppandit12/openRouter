require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/v1', require('./routes/proxyRoutes'));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Gateway Backend started on port ${PORT}`));
