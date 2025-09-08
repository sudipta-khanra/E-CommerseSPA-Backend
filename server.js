const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

connectDB();

const corsOptions = {
  origin: [
    "http://localhost:3000",                     
    "https://e-commerse-spa-frontend.vercel.app" 
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, 
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/cart', require('./routes/cart'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
