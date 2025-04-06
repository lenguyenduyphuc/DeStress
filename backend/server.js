const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { requireAuth, clerkMiddleware } = require('@clerk/express');
const chatRouter = require('./controllers/chat');
const chatUserRouter = require('./controllers/users');

dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

app.use(clerkMiddleware());

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

// Add a root endpoint for testing connection
app.get('/', (req, res) => {
  res.json({ message: 'API server is running' });
});

// API routes
app.use('/api/chats', chatRouter);
app.use('/api/users', chatUserRouter);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to the database successfully.");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
};

app.listen(port, () => {
  connect();
  console.log(`Server is running on port ${port}`);
});