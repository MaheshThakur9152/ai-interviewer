import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
    // Save meeting notes
    saveMeetingNotes: async (callId: string, notes: any) => {
        try {
            const key = `meeting_notes_${callId}`;
            await AsyncStorage.setItem(key, JSON.stringify(notes));
        } catch (e) {
            console.error('Storage Error: saveMeetingNotes', e);
        }
    },

    // Get meeting notes
    getMeetingNotes: async (callId: string) => {
        try {
            const key = `meeting_notes_${callId}`;
            const data = await AsyncStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Storage Error: getMeetingNotes', e);
            return null;
        }
    },

    // Save all meetings list
    saveMeetingToHistory: async (callId: string, summary: string) => {
        try {
            const key = 'meetings_history';
            const existing = await AsyncStorage.getItem(key);
            const meetings = existing ? JSON.parse(existing) : [];

            // Avoid duplicates
            if (!meetings.find((m: any) => m.id === callId)) {
                meetings.unshift({
                    id: callId,
                    summary,
                    timestamp: new Date().toISOString()
                });
                await AsyncStorage.setItem(key, JSON.stringify(meetings.slice(0, 50))); // Keep last 50
            }
        } catch (e) {
            console.error('Storage Error: saveMeetingToHistory', e);
        }
    },

    // Get meetings history
    getMeetingsHistory: async () => {
        try {
            const data = await AsyncStorage.getItem('meetings_history');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Storage Error: getMeetingsHistory', e);
            return [];
        }
    },

    // Save generated images
    saveGeneratedImages: async (callId: string, imageUris: string[]) => {
        try {
            const key = `images_${callId}`;
            const existing = await AsyncStorage.getItem(key);
            const images = existing ? JSON.parse(existing) : [];
            const newImages = [...new Set([...images, ...imageUris])];
            await AsyncStorage.setItem(key, JSON.stringify(newImages));
        } catch (e) {
            console.error('Storage Error: saveGeneratedImages', e);
        }
    },

    // Get images for a call
    getCallImages: async (callId: string) => {
        try {
            const data = await AsyncStorage.getItem(`images_${callId}`);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Storage Error: getCallImages', e);
            return [];
        }
    },

    // Save Chat Logs (Full transcript)
    saveTranscript: async (callId: string, transcript: string) => {
        try {
            const key = `transcript_${callId}`;
            await AsyncStorage.setItem(key, transcript);
        } catch (e) {
            console.error('Storage Error: saveTranscript', e);
        }
    },

    // Get Chat Logs
    getTranscript: async (callId: string) => {
        try {
            const key = `transcript_${callId}`;
            return await AsyncStorage.getItem(key);
        } catch (e) {
            console.error('Storage Error: getTranscript', e);
            return null;
        }
    }
};
