import { Platform } from 'react-native';

export const API_URL = 'http://10.0.2.2:3000'; // Android Emulator localhost

console.log('[API] Using API_URL:', API_URL);

export const api = {
    login: async (userId: string, name: string, email?: string, image?: string) => {
        try {
            console.log('[API] Logging in:', { userId, name });
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, name, email, image }),
            });
            if (!res.ok) {
                const errorText = await res.text();
                console.error('[API] Login failed:', res.status, errorText);
                throw new Error('Login failed');
            }
            const data = await res.json();
            console.log('[API] Login successful');
            return data;
        } catch (e) {
            console.error("[API] Login Error", e);
            throw e;
        }
    },

    generateNotes: async (transcript: string) => {
        try {
            console.log('[API] Generating notes for transcript:', transcript.substring(0, 100));
            const res = await fetch(`${API_URL}/api/ai/generate-notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcript }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error('[API] Generate notes failed:', res.status, errorText);
                throw new Error(`Failed to generate notes: ${res.status}`);
            }

            const data = await res.json();
            console.log('[API] Notes generated successfully:', data);
            return data;
        } catch (e) {
            console.error("[API] Generate Notes Error", e);
            throw e;
        }
    },

    generateMoodboard: async (prompt: string) => {
        try {
            console.log('[API] Generating moodboard for:', prompt);
            const res = await fetch(`${API_URL}/api/ai/moodboard`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error('[API] Moodboard generation failed:', res.status, errorText);
                throw new Error(`Failed to generate moodboard: ${res.status}`);
            }

            const data = await res.json();
            console.log('[API] Moodboard generated:', data.images?.length, 'images');
            return data;
        } catch (e) {
            console.error("[API] Moodboard Generation Error", e);
            throw e;
        }
    },

    chatAI: async (message: string, history: any[]) => {
        try {
            const res = await fetch(`${API_URL}/api/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, history }),
            });
            if (!res.ok) throw new Error(`Chat failed: ${res.status}`);
            return res.json();
        } catch (e) {
            console.error("[API] AI Chat Error", e);
            throw e;
        }
    }
};
