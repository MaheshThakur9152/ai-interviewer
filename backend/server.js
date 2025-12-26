const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Vite dev server
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB (optional, for storing meetings/users)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aether', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// Socket.IO for real-time communication
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-meeting', (meetingId) => {
    socket.join(meetingId);
    socket.to(meetingId).emit('user-joined', socket.id);
  });

  socket.on('leave-meeting', (meetingId) => {
    socket.leave(meetingId);
    socket.to(meetingId).emit('user-left', socket.id);
  });

  socket.on('send-message', (data) => {
    io.to(data.meetingId).emit('receive-message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Aether Backend API' });
});

// AI Chat endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();
    res.json({ response: text });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: 'AI service error' });
  }
});

// Meeting creation endpoint
app.post('/api/meetings', (req, res) => {
  // Simple meeting creation
  const meetingId = Math.random().toString(36).substring(7);
  res.json({ meetingId, message: 'Meeting created' });
});

// Auth verification (simplified)
app.post('/api/auth/verify', (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    res.json({ user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});