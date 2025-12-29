
import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient, LiveClient, LiveConnectionState } from '@deepgram/sdk';
import { useInterviewStore } from '../store/useInterviewStore';

const VITE_DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY;

export const useDeepgram = () => {
    const { setMicActive, setAudioPlaying, addMessage, isMicActive, setVolumeLevel } = useInterviewStore();
    const [connectionState, setConnectionState] = useState<LiveConnectionState>(LiveConnectionState.CLOSED);
    const deepgramRef = useRef<LiveClient | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    const connectToDeepgram = useCallback(async () => {
        if (!VITE_DEEPGRAM_API_KEY) {
            console.error("Deepgram API Key is missing");
            return;
        }

        try {
            const deepgram = createClient(VITE_DEEPGRAM_API_KEY);
            const connection = deepgram.listen.live({
                model: "nova-2",
                language: "en-US",
                smart_format: true,
            });

            connection.on(LiveConnectionState.OPEN, () => {
                setConnectionState(LiveConnectionState.OPEN);
                console.log("Deepgram Connection Open");
            });

            connection.on(LiveConnectionState.CLOSE, () => {
                setConnectionState(LiveConnectionState.CLOSED);
            });

            connection.on(LiveConnectionState.METADATA, (data) => {
                console.log(data);
            });

            connection.on("Results", (data) => {
                const transcript = data.channel.alternatives[0]?.transcript;
                if (transcript && data.is_final) {
                    addMessage('user', transcript);
                    // Here we would trigger the AI response logic
                }
            });

            deepgramRef.current = connection;

            // Start Microphone
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (!MediaRecorder.isTypeSupported('audio/webm')) {
                console.warn("Browser does not support audio/webm");
                return;
            }

            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.addEventListener('dataavailable', (event) => {
                if (event.data.size > 0 && deepgramRef.current?.getReadyState() === 1) {
                    deepgramRef.current.send(event.data);
                }
            });

            mediaRecorder.start(250); // Send slice every 250ms
            setMicActive(true);

            // Visualizer logic (simple volume meter)
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            const analyzer = audioContext.createAnalyser();
            analyzer.fftSize = 256;
            source.connect(analyzer);
            const dataArray = new Uint8Array(analyzer.frequencyBinCount);

            const updateVolume = () => {
                if (!isMicActive) return;
                analyzer.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
                setVolumeLevel(average);
                requestAnimationFrame(updateVolume);
            };
            updateVolume();

        } catch (error) {
            console.error("Deepgram connection failed:", error);
        }
    }, [addMessage, setMicActive, setVolumeLevel, isMicActive]);

    const disconnectDeepgram = useCallback(() => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            mediaRecorderRef.current = null;
        }
        if (deepgramRef.current) {
            deepgramRef.current.finish();
            deepgramRef.current = null;
        }
        setMicActive(false);
        setConnectionState(LiveConnectionState.CLOSED);
    }, [setMicActive]);

    return {
        connectToDeepgram,
        disconnectDeepgram,
        connectionState
    };
};
