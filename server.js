const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
require('dotenv').config();

// Connect database
connectDB();

// Middleware
const corsOptions = {
  origin: 'https://e-commerse-spa-frontend.vercel.app/', // frontend URL
  methods: 'GET,PUT,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/cart', require('./routes/cart'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
