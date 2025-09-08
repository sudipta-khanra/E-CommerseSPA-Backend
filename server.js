const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
require('dotenv').config();

// Connect to DB
connectDB();

// CORS options
const corsOptions = {
  origin: [
    "https://e-commerse-spa-frontend.vercel.app", // production
    /\.vercel\.app$/ // allow all Vercel preview deployments
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
  credentials: true
};

// Apply CORS
app.use(cors(corsOptions));
app.options("/*", cors(corsOptions)); // ✅ use "/*" instead of "*"

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/cart', require('./routes/cart'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
