"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const node_sdk_1 = require("@stream-io/node-sdk");
const stream_chat_1 = require("stream-chat");
const axios_1 = __importDefault(require("axios"));
const sdk_1 = require("@deepgram/sdk");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const PORT = process.env.PORT || 3000;
// Deepgram Setup
const deepgram = (0, sdk_1.createClient)(process.env.DEEPGRAM_API_KEY || "");
// Stream Config
const STREAM_API_KEY = process.env.STREAM_API_KEY || "";
const STREAM_API_SECRET = process.env.STREAM_API_SECRET || "";
if (!STREAM_API_KEY || !STREAM_API_SECRET) {
    console.warn("Missing STREAM_API_KEY or STREAM_API_SECRET. Auth will fail.");
}
// Clients
// Video Client
let streamVideoClient;
let streamChatClient;
if (STREAM_API_KEY && STREAM_API_SECRET) {
    streamVideoClient = new node_sdk_1.StreamClient(STREAM_API_KEY, STREAM_API_SECRET);
    streamChatClient = stream_chat_1.StreamChat.getInstance(STREAM_API_KEY, STREAM_API_SECRET);
}
app.get('/', (req, res) => {
    res.send('FaceTime AI Backend is Running');
});
// Auth Endpoint: Generates a token for a user
app.post('/auth/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, name, email, image } = req.body;
    if (!userId) {
        res.status(400).json({ error: 'userId is required' });
        return;
    }
    if (!streamVideoClient || !streamChatClient) {
        res.status(503).json({ error: 'Stream Clients not initialized (Key/Secret missing)' });
        return;
    }
    try {
        // Upsert user in Chat
        yield streamChatClient.upsertUser({
            id: userId,
            name: name || userId,
            image: image,
            email: email
        });
        // Generate Token
        const token = streamVideoClient.createToken(userId);
        res.json({
            userId,
            token,
            name,
            apiKey: STREAM_API_KEY
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate token' });
    }
}));
// AI endpoints (Stubs)
// AI Endpoints
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
app.post('/api/ai/generate-notes', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { transcript } = req.body;
    if (!transcript) {
        res.status(400).json({ error: 'Transcript is required' });
        return;
    }
    try {
        // Prompt Engineering for Meeting Minutes
        const prompt = `
        You are an elite Executive Assistant. Analyze the following meeting transcript and generate a structured summary.
        
        Transcript:
        "${transcript}"
        
        Output format (JSON):
        {
            "summary": "Brief summary...",
            "decisions": ["Decision 1", "Decision 2"],
            "action_items": ["Action 1", "Action 2"],
            "mood": "Professional/Tense/Creative"
        }
        Return ONLY valid JSON.
        `;
        const response = yield axios_1.default.post(`${OLLAMA_BASE_URL}/api/generate`, {
            model: process.env.OLLAMA_MODEL || "mistral",
            prompt: prompt,
            stream: false,
            format: "json"
        });
        res.json(JSON.parse(response.data.response));
    }
    catch (error) {
        console.error("AI Generation Error", error);
        // Fallback for demo if AI fails/offline
        res.json({
            summary: "Meeting processing simulated (Ollama not reachable).",
            decisions: ["Review project timeline", "Deploy MVP"],
            action_items: ["Check API keys", "Restart server"],
            mood: "Productive"
        });
    }
}));
app.post('/api/ai/moodboard', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { prompt } = req.body;
    // For MVP, we will use Unsplash for "High Quality" images as Ollama is text-only usually.
    // If User has Stable Diffusion API, they can swap this.
    // We return a list of image URLs.
    try {
        const images = [
            `https://source.unsplash.com/random/800x600/?${encodeURIComponent(prompt)}&sig=1`,
            `https://source.unsplash.com/random/800x600/?${encodeURIComponent(prompt)}&sig=2`,
            `https://source.unsplash.com/random/800x600/?${encodeURIComponent(prompt)}&sig=3`,
            `https://source.unsplash.com/random/800x600/?${encodeURIComponent(prompt)}&sig=4`
        ];
        res.json({ images });
    }
    catch (e) {
        res.status(500).json({ error: "Failed to generate moodboard" });
    }
}));
app.post('/api/ai/transcribe', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { url } = req.body;
    if (!url) {
        res.status(400).json({ error: "Audio URL is required" });
        return;
    }
    try {
        const { result, error } = yield deepgram.listen.prerecorded.transcribeUrl({ url }, { smart_format: true, model: "nova-2", language: "en-US" });
        if (error)
            throw error;
        res.json({ transcript: result.results.channels[0].alternatives[0].transcript });
    }
    catch (e) {
        console.error("Deepgram Error", e);
        res.status(500).json({ error: "Transcription failed" });
    }
}));
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
