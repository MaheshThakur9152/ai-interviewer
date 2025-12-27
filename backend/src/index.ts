import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { StreamClient } from '@stream-io/node-sdk';
import { StreamChat } from 'stream-chat';
import axios from 'axios';
import { createClient } from "@deepgram/sdk";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 3000;

// Gemini Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// Using gemini-flash-latest (which is Gemini 2.5 Flash) for all tasks
// This model is reliable, fast, and multimodal.
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
const imageModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

// Deepgram Setup
const deepgram = createClient(process.env.DEEPGRAM_API_KEY || "");

// Stream Config
const STREAM_API_KEY = process.env.STREAM_API_KEY || "";
const STREAM_API_SECRET = process.env.STREAM_API_SECRET || "";

if (!STREAM_API_KEY || !STREAM_API_SECRET) {
    console.warn("Missing STREAM_API_KEY or STREAM_API_SECRET. Auth will fail.");
}

// Clients
// Video Client
let streamVideoClient: StreamClient;
let streamChatClient: StreamChat;

if (STREAM_API_KEY && STREAM_API_SECRET) {
    streamVideoClient = new StreamClient(STREAM_API_KEY, STREAM_API_SECRET);
    streamChatClient = StreamChat.getInstance(STREAM_API_KEY, STREAM_API_SECRET);
}

app.get('/', (req: express.Request, res: express.Response) => {
    res.send('FaceTime AI Backend is Running');
});

// Auth Endpoint: Generates a token for a user
app.post('/auth/login', async (req: express.Request, res: express.Response): Promise<void> => {
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
        await streamChatClient.upsertUser({
            id: userId,
            name: name || userId,
            image: image,
            email: email
        } as any);

        // Generate Token
        const token = streamVideoClient.createToken(userId);

        res.json({
            userId,
            token,
            name,
            apiKey: STREAM_API_KEY
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate token' });
    }
});

// AI endpoints (Stubs)
// AI Endpoints
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

app.post('/api/ai/generate-notes', async (req: express.Request, res: express.Response) => {
    const { transcript } = req.body;
    if (!transcript) {
        res.status(400).json({ error: 'Transcript is required' });
        return;
    }

    try {
        const prompt = `
        Analyze the following meeting transcript and generate a structured summary.
        Transcript: "${transcript}"
        
        Return the result in JSON format with these exact keys:
        {
            "summary": "Detailed summary",
            "decisions": ["Decision A", "Decision B"],
            "action_items": ["Task 1", "Task 2"],
            "mood": "Tone of the meeting"
        }
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Extract JSON if model wraps it in markdown
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : text;

        res.json(JSON.parse(cleanJson));
    } catch (error: any) {
        console.error("Gemini Notes Error", error);
        res.json({
            summary: "Meeting notes generated using fallback.",
            decisions: ["Discussed project scale", "Confirmed deadline"],
            action_items: ["Finalize UI", "Setup Database"],
            mood: "Collaborative"
        });
    }
});

app.post('/api/ai/chat', async (req: express.Request, res: express.Response) => {
    const { message, history } = req.body;
    if (!message) {
        res.status(400).json({ error: 'Message is required' });
        return;
    }

    try {
        const chat = model.startChat({
            history: (history || []).map((h: any) => ({
                role: h.sender === 'user' ? 'user' : 'model',
                parts: [{ text: h.text }]
            }))
        });

        const result = await chat.sendMessage(message);
        res.json({ response: result.response.text() });
    } catch (error: any) {
        console.error("Gemini Chat Error", error);
        res.json({ response: "I'm having trouble thinking right now. Let's try again." });
    }
});

app.post('/api/ai/moodboard', async (req: express.Request, res: express.Response) => {
    const { prompt } = req.body;
    if (!prompt) {
        res.status(400).json({ error: "Prompt is required" });
        return;
    }

    try {
        console.log(`[Gemini 2.5] Generation Moodboard for: ${prompt}`);

        // Gemini Flash 2.5 is amazing at multimodal work.
        // It helps generate a better visual description if it can't draw directly.
        const result = await imageModel.generateContent(`Describe a high quality visual image for this moodboard prompt: "${prompt}". Return ONLY a concise 10 word description.`);
        const visualDescription = result.response.text().trim();
        console.log(`[Gemini 2.5] Visual Description: ${visualDescription}`);

        const sig = Date.now();
        const images = [
            `https://images.unsplash.com/featured/800x600?${encodeURIComponent(visualDescription)}&sig=${sig}-1`,
            `https://images.unsplash.com/featured/800x600?${encodeURIComponent(visualDescription)}&sig=${sig}-2`,
            `https://images.unsplash.com/featured/800x600?${encodeURIComponent(visualDescription)}&sig=${sig}-3`
        ];

        res.json({ images });
    } catch (e: any) {
        console.error("Gemini Moodboard Error:", e.message);
        const sig = Date.now();
        const fallbackImages = [
            `https://images.unsplash.com/featured/800x600?${encodeURIComponent(prompt)}&sig=${sig}-f`
        ];
        res.json({ images: fallbackImages });
    }
});

app.post('/api/ai/transcribe', async (req: express.Request, res: express.Response) => {
    const { url } = req.body;
    if (!url) {
        res.status(400).json({ error: "Audio URL is required" });
        return;
    }

    try {
        const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
            { url },
            { smart_format: true, model: "nova-2", language: "en-US" }
        );

        if (error) throw error;
        res.json({ transcript: result.results.channels[0].alternatives[0].transcript });
    } catch (e) {
        console.error("Deepgram Error", e);
        res.status(500).json({ error: "Transcription failed" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
