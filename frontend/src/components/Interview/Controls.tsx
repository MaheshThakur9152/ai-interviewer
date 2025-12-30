import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Play, Loader2 } from 'lucide-react';
import { useInterviewStore } from '../../store/useInterviewStore';

const Controls: React.FC = () => {
    const { isMicActive, setMicActive, code, setTerminalOutput, addMessage, setAudioPlaying } = useInterviewStore();
    const [isConnected, setIsConnected] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const deepgramSocketRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        return () => {
            cleanup();
        };
    }, []);

    useEffect(() => {
        if (isMicActive) {
            startAgent();
        } else {
            cleanup();
        }
    }, [isMicActive]);

    const startAgent = async () => {
        try {
            // Get Deepgram API key from backend
            const response = await fetch(`${API_URL}/api/auth/deepgram`);
            const data = await response.json();

            if (!data.key) {
                setTerminalOutput({ type: 'error', message: 'Failed to get Deepgram API key' });
                setMicActive(false);
                return;
            }

            const apiKey = data.key.trim();

            // Start with greeting
            const greeting = "Hello! I'm your AI interview coach. I'm here to help you practice for technical interviews. Are you ready to start?";
            await speak(greeting);
            addMessage('assistant', greeting);

            // Connect to Deepgram STT
            await connectToDeepgram(apiKey);

        } catch (error) {
            console.error('Failed to start agent:', error);
            setTerminalOutput({ type: 'error', message: 'Failed to start agent' });
            setMicActive(false);
        }
    };

    const connectToDeepgram = async (apiKey: string) => {
        try {
            // Get microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Create Deepgram WebSocket connection for STT
            const deepgramUrl = 'wss://api.deepgram.com/v1/listen?encoding=linear16&sample_rate=16000&language=en&model=nova-2&smart_format=true';
            const socket = new WebSocket(deepgramUrl, ['token', apiKey]);

            deepgramSocketRef.current = socket;

            socket.onopen = () => {
                console.log('Deepgram STT connected');
                setIsConnected(true);
                setTerminalOutput({ type: 'success', message: 'Listening... speak now!' });

                // Start sending audio
                startAudioStreaming(stream, socket);
            };

            socket.onmessage = async (message) => {
                const data = JSON.parse(message.data);

                if (data.channel?.alternatives?.[0]?.transcript) {
                    const transcript = data.channel.alternatives[0].transcript;
                    const isFinal = data.is_final;

                    if (isFinal && transcript.trim().length > 0) {
                        console.log('Transcript:', transcript);

                        // Add user message
                        addMessage('user', transcript);
                        setTerminalOutput({ type: 'info', message: `You: ${transcript}` });

                        // Process with AI
                        await processWithAI(transcript);
                    }
                }
            };

            socket.onerror = (error) => {
                console.error('Deepgram error:', error);
                setTerminalOutput({ type: 'error', message: 'Speech recognition error' });
            };

            socket.onclose = () => {
                console.log('Deepgram connection closed');
                setIsConnected(false);
            };

        } catch (error: any) {
            console.error('Microphone access error:', error);
            setTerminalOutput({ type: 'error', message: 'Microphone access denied' });
            setMicActive(false);
        }
    };

    const startAudioStreaming = (stream: MediaStream, socket: WebSocket) => {
        const audioContext = new AudioContext({ sampleRate: 16000 });
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);

        source.connect(processor);
        processor.connect(audioContext.destination);

        processor.onaudioprocess = (e) => {
            if (socket.readyState === WebSocket.OPEN && !isSpeaking) {
                const inputData = e.inputBuffer.getChannelData(0);
                const buffer = new ArrayBuffer(inputData.length * 2);
                const view = new DataView(buffer);

                for (let i = 0; i < inputData.length; i++) {
                    const s = Math.max(-1, Math.min(1, inputData[i]));
                    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
                }

                socket.send(buffer);
            }
        };

        // Store for cleanup
        (socket as any).audioProcessor = processor;
        (socket as any).mediaStream = stream;
    };

    const processWithAI = async (userInput: string) => {
        setTerminalOutput({ type: 'info', message: 'AI is thinking...' });

        try {
            const response = await fetch(`${API_URL}/api/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userInput,
                    context: 'technical-interview',
                    code: code || ''
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            const aiResponse = data.response;

            // Add AI message
            addMessage('assistant', aiResponse);
            setTerminalOutput({ type: 'success', message: `AI: ${aiResponse}` });

            // Speak the response
            await speak(aiResponse);

        } catch (error) {
            console.error('AI processing error:', error);
            const errorMsg = 'Sorry, I encountered an error. Could you please repeat that?';
            setTerminalOutput({ type: 'error', message: errorMsg });
            await speak(errorMsg);
        }
    };

    const speak = async (text: string): Promise<void> => {
        try {
            setIsSpeaking(true);
            setAudioPlaying(true);
            console.log('Speaking with Deepgram Aura:', text);

            // Get Deepgram API key
            const response = await fetch(`${API_URL}/api/auth/deepgram`);
            const data = await response.json();

            if (!data.key) {
                throw new Error('No Deepgram API key');
            }

            const apiKey = data.key.trim();

            // Call Deepgram TTS API
            const ttsResponse = await fetch('https://api.deepgram.com/v1/speak?model=aura-asteria-en&encoding=linear16&sample_rate=24000', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });

            if (!ttsResponse.ok) {
                throw new Error(`Deepgram TTS failed: ${ttsResponse.status}`);
            }

            // Get audio data
            const audioBlob = await ttsResponse.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            // Play audio
            const audio = new Audio(audioUrl);

            await new Promise<void>((resolve, reject) => {
                audio.onended = () => {
                    URL.revokeObjectURL(audioUrl);
                    setIsSpeaking(false);
                    setAudioPlaying(false);
                    setTerminalOutput({ type: 'success', message: 'Listening... speak now!' });
                    console.log('Audio playback ended');
                    resolve();
                };

                audio.onerror = (e) => {
                    URL.revokeObjectURL(audioUrl);
                    setIsSpeaking(false);
                    setAudioPlaying(false);
                    console.error('Audio playback error:', e);
                    reject(new Error('Audio playback failed'));
                };

                audio.play().catch(err => {
                    console.error('Play failed:', err);
                    reject(err);
                });
            });

        } catch (error) {
            console.error('TTS error:', error);
            setIsSpeaking(false);
            setAudioPlaying(false);
            setTerminalOutput({ type: 'error', message: 'Speech failed - continuing without audio' });
        }
    };

    const cleanup = () => {
        // Close Deepgram socket
        if (deepgramSocketRef.current) {
            const socket = deepgramSocketRef.current;

            // Stop audio streaming
            if ((socket as any).audioProcessor) {
                (socket as any).audioProcessor.disconnect();
            }
            if ((socket as any).mediaStream) {
                (socket as any).mediaStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
            }

            if (socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
            deepgramSocketRef.current = null;
        }

        // Close audio context
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        setIsConnected(false);
        setIsSpeaking(false);
        setAudioPlaying(false);
    };

    const getStatusText = () => {
        if (!isMicActive) return 'Start Agent';
        if (isSpeaking) return 'AI Speaking...';
        if (isConnected) return 'Listening...';
        return 'Connecting...';
    };

    const getStatusIcon = () => {
        if (isSpeaking) return <Loader2 size={16} className="animate-spin" />;
        if (isMicActive) return <MicOff size={16} />;
        return <Mic size={16} />;
    };

    return (
        <div className="flex items-center gap-4 bg-black/60 backdrop-blur-xl border border-white/10 p-2 rounded-full shadow-2xl">
            <button
                onClick={() => setMicActive(!isMicActive)}
                className={`flex items-center gap-3 px-6 py-3 rounded-full font-bold text-xs transition-all ${isMicActive
                    ? 'bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
            >
                {getStatusIcon()}
                <span className="tracking-wide">{getStatusText()}</span>
            </button>
            <div className="h-8 w-[1px] bg-white/10 mx-2"></div>
            <button
                onClick={() => setTerminalOutput({ type: 'info', message: 'Solution submitted.' })}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-white/20"
            >
                <Play size={16} fill="currentColor" /> Submit Solution
            </button>
        </div>
    );
};

export default Controls;
