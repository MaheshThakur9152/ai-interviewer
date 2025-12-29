
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const jwt = require('jsonwebtoken');
const http = require('http');
const socketIo = require('socket.io');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  otp: String,
  otpExpires: Date,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Socket.IO
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

// --- Routes ---

app.get('/', (req, res) => {
  res.json({ message: 'Aether Backend API is running' });
});

// 1. Auth: Send OTP
app.post('/api/auth/login', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, name: email.split('@')[0] });
    }
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    console.log(`DEV OTP for ${email}: ${otp}`);

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Your Aether Login OTP',
      text: `Your OTP is: ${otp}`,
      html: `<div style="font-family: sans-serif; padding: 20px;">
              <h2>Welcome to Aether</h2>
              <p>Your One-Time Password (OTP) is:</p>
              <h1 style="color: #6d28d9; letter-spacing: 5px;">${otp}</h1>
              <p>This code expires in 10 minutes.</p>
            </div>`
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Failed to process login' });
  }
});

// 2. Auth: Verify OTP & Create User
app.post('/api/auth/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !user.otp || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    // Clear OTP
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// 3. AI Chat - Using DigitalOcean Llama 3.2 8B
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, context, code } = req.body;

    // Construct System Prompt
    let systemPrompt = "You are a helpful AI assistant.";
    if (context === 'technical-interview') {
      systemPrompt = `You are a technical interviewer for a senior software engineering role. 
      The candidate is solving a problem. 
      
      Current Code in Editor:
      ${code || "No code written yet."}
      
      Instructions:
      1. Analyze the code for correctness, time complexity (Big O), and style.
      2. If the user asks a question, answer it.
      3. If the user submits a solution, critique it.
      4. Be encouraging but rigorous. 
      5. Keep responses concise (under 3 sentences unless detailed explanation is requested).
      `;
    }

    const DO_URL = process.env.OLLAMA_BASE_URL || 'https://inference.do-ai.run/v1';
    const DO_MODEL = process.env.OLLAMA_MODEL || 'llama3-8b-instruct';
    const DO_KEY = process.env.OLLAMA_API_KEY;

    console.log(`Processing AI request via DigitalOcean Llama (${DO_MODEL})...`);

    const response = await fetch(`${DO_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DO_KEY}`
      },
      body: JSON.stringify({
        model: DO_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DigitalOcean API Error:", errorText);
      throw new Error(`DigitalOcean API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;

    console.log("AI Response received successfully");
    res.json({ response: text });
  } catch (error) {
    console.error('AI Service Error:', error.message);
    res.status(500).json({ error: 'AI service error: ' + error.message });
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});