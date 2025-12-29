import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Play, Loader2 } from 'lucide-react';
import { useInterviewStore } from '../../store/useInterviewStore';
import { dsaQuestions } from '../../data/dsaQuestions';

const Controls: React.FC = () => {
    const { isMicActive, setMicActive, code, setTerminalOutput, setEditorFrozen, addMessage, setAudioPlaying } = useInterviewStore();
    const [deepgramKey, setDeepgramKey] = useState<string | null>(null);
    const [connectionState, setConnectionState] = useState<'closed' | 'connecting' | 'connected'>('closed');

    // Agent Refs
    const socketRef = useRef<WebSocket | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef<number>(0);

    // 1. Fetch Deepgram Key
    useEffect(() => {
        const fetchKey = async () => {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            try {
                const res = await fetch(`${API_URL}/api/auth/deepgram`);
                const data = await res.json();
                if (data.key) setDeepgramKey(data.key);
            } catch (e) {
                console.error("Failed to fetch Deepgram key:", e);
            }
        };
        fetchKey();
    }, []);

    // 2. Manage Voice Agent Connection
    useEffect(() => {
        if (isMicActive && deepgramKey) {
            startAgent();
        } else {
            stopAgent();
        }
        return () => stopAgent();
    }, [isMicActive, deepgramKey]);

    const startAgent = async () => {
        if (!deepgramKey) return;
        setConnectionState('connecting');

        try {
            // A. Setup Audio Context for Playback
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            nextStartTimeRef.current = audioContextRef.current.currentTime;

            // B. Connect to Deepgram Agent API
            const ws = new WebSocket('wss://agent.deepgram.com/agent', ['token', deepgramKey]);
            socketRef.current = ws;

            ws.onopen = async () => {
                console.log("Agent Connected");
                setConnectionState('connected');

                // C. Send Configuration
                const kbString = dsaQuestions.map(q =>
                    `Question: ${q.title}\nDifficulty: ${q.difficulty}\nDescription: ${q.description}\nSolution Python:\n${q.solution}\n`
                ).join("\n---\n");

                const config = {
                    type: "Settings",
                    audio: {
                        input: { encoding: "linear16", sample_rate: 48000 },
                        output: { encoding: "linear16", sample_rate: 24000, container: "none" }
                    },
                    agent: {
                        language: "en",
                        speak: { provider: { type: "eleven_labs", model_id: "eleven_multilingual_v2", voice_id: "cgSgspJ2msm6clMCkdW9" } },
                        listen: { provider: { type: "deepgram", version: "v1", model: "nova-3" } },
                        think: {
                            provider: { type: "google", model: "gemini-2.5-flash" },
                            prompt: `#Role\nYou are an AI interview coach helping users prepare for software and technical interviews.\n\n#Knowledge Base (Questions & Solutions)\n${kbString}\n\n#General Guidelines\n-Be warm, confident, and encouraging.\n-Speak clearly in simple language.\n-Keep most responses short unless asked for deeper explanation.\n` +
                                `#Voice-Specific Instructions\n-Speak conversationally.\n-Pause after questions.\n` +
                                `#Interview Flow Objective\n-Greet the user: "Hi, I’m your interview coach. Ready to practice?"\n` +
                                `If user asks to start, pick a question from the Knowledge Base or ask standard behavioral ones.`
                        },
                        greeting: "Hello, I’m your AI interview coach. Are you ready to practice?"
                    }
                };

                ws.send(JSON.stringify(config));

                // D. Start Microphone Recording (Linear16 48kHz for Input)
                startMicrophone(ws);
            };

            ws.onmessage = async (event) => {
                if (event.data instanceof Blob) {
                    // Audio Data (Output)
                    const arrayBuffer = await event.data.arrayBuffer();
                    playAudioChunk(arrayBuffer);
                    setAudioPlaying(true);

                    // Reset playing state after estimated duration if idle? 
                    // Difficult with streaming. We just set it true.
                    // We might need a timeout to set it false if no data comes.
                    resetSilenceTimer();
                } else {
                    // Text Data (Transcripts, etc.)
                    try {
                        const msg = JSON.parse(event.data);
                        // Deepgram Agent typically sends JSON messages for structure
                        // But in basic raw mode it might just send audio binary
                        // Check documentation. Actually Agent API sends JSON control messages too.
                        // Assuming binary is audio, text is control? 
                        // Actually the SDK handles this. Raw WS might mix text/binary.
                        if (msg.type === 'UserStartedSpeaking') {
                            setTerminalOutput({ type: 'info', message: 'User Speaking...' });
                        }
                        if (msg.type === 'AgentStartedSpeaking') {
                            setTerminalOutput({ type: 'info', message: 'AI Speaking...' });
                            setAudioPlaying(true);
                        }
                        if (msg.type === 'AgentStoppedSpeaking') {
                            setAudioPlaying(false);
                        }
                    } catch (e) { /* likely binary audio if parse fails or handled above */ }
                }
            };

            ws.onclose = () => {
                console.log("Agent Disconnected");
                stopAgent();
            };

            ws.onerror = (e) => {
                console.error("Agent Error:", e);
                stopAgent();
            };

        } catch (e) {
            console.error("Agent Start Failed:", e);
            stopAgent();
        }
    };

    const startMicrophone = async (ws: WebSocket) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 48000, channelCount: 1 } });

            // Use AudioContext to resample/convert to raw PCM INT16 if needed
            // But MediaRecorder outputting webm/opus is NOT linear16.
            // Deepgram Agent expects RAW LINEAR16 if we specified it in config.
            // We must convert.

            const context = new AudioContext({ sampleRate: 48000 });
            const source = context.createMediaStreamSource(stream);
            const processor = context.createScriptProcessor(4096, 1, 1);

            source.connect(processor);
            processor.connect(context.destination);

            processor.onaudioprocess = (e) => {
                if (ws.readyState !== WebSocket.OPEN) return;

                const inputData = e.inputBuffer.getChannelData(0);
                // Downsample or convert Float32 to Int16
                const buffer = new ArrayBuffer(inputData.length * 2);
                const view = new DataView(buffer);
                for (let i = 0; i < inputData.length; i++) {
                    let s = Math.max(-1, Math.min(1, inputData[i]));
                    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true); // Little Endian
                }
                ws.send(buffer);
            };

            // Store so we can close
            (socketRef.current as any).audioContextInput = context;
            (socketRef.current as any).audioStream = stream;

        } catch (e) {
            console.error("Microphone Error", e);
            stopAgent();
        }
    };

    const stopAgent = () => {
        if (socketRef.current) {
            const ws = socketRef.current;
            ws.close();
            if ((ws as any).audioContextInput) (ws as any).audioContextInput.close();
            if ((ws as any).audioStream) (ws as any).audioStream.getTracks().forEach((t: any) => t.stop());
            socketRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        setConnectionState('closed');
        setMicActive(false);
        setAudioPlaying(false);
    };

    // Helper: Play Linear16 PCM 24kHz
    const playAudioChunk = (arrayBuffer: ArrayBuffer) => {
        if (!audioContextRef.current) return;

        const int16Array = new Int16Array(arrayBuffer);
        const float32Array = new Float32Array(int16Array.length);

        for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 32768.0;
        }

        const buffer = audioContextRef.current.createBuffer(1, float32Array.length, 24000);
        buffer.getChannelData(0).set(float32Array);

        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);

        if (nextStartTimeRef.current < audioContextRef.current.currentTime) {
            nextStartTimeRef.current = audioContextRef.current.currentTime;
        }
        source.start(nextStartTimeRef.current);
        nextStartTimeRef.current += buffer.duration;
    };

    // Timer to reset "Audio Playing" visualizer if silence
    const silenceTimerRef = useRef<any>(null);
    const resetSilenceTimer = () => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => setAudioPlaying(false), 1000); // 1s tolerance
    };


    // --- Old Text Submission (Backwards Compatible) ---
    const processAIResponse = async (input: string, currentCode: string) => {
        setAudioPlaying(true);
        // Fallback to old backend LLM for manual text submission
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input, context: 'technical-interview', code: currentCode })
            });
            const data = await res.json();
            addMessage('assistant', data.response);

            // TTS via Deepgram Aura REST (if key avail)
            if (deepgramKey) playDeepgramTTS(data.response);
        } catch (e) {
            setTerminalOutput({ type: 'error', message: 'Failed to get review.' });
            setAudioPlaying(false);
        }
    };

    const playDeepgramTTS = async (text: string) => {
        try {
            const res = await fetch(`https://api.deepgram.com/v1/speak?model=aura-asteria-en`, {
                method: 'POST',
                headers: { 'Authorization': `Token ${deepgramKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            const blob = await res.blob();
            const audio = new Audio(URL.createObjectURL(blob));
            audio.onended = () => setAudioPlaying(false);
            setAudioPlaying(true);
            await audio.play();
        } catch (e) { }
    };

    const handleSubmitCode = async () => {
        setEditorFrozen(true);
        setTerminalOutput({ type: 'info', message: 'Submitting to AI Reviewer...' });
        try {
            await processAIResponse("I have submitted my solution. Please review it.", code);
            setTerminalOutput({ type: 'success', message: 'Review received from AI.' });
        } catch (e) {
            setTerminalOutput({ type: 'error', message: 'Error submitting.' });
        } finally {
            setEditorFrozen(false);
        }
    };

    return (
        <div className="flex items-center gap-4 bg-black/60 backdrop-blur-xl border border-white/10 p-2 rounded-full shadow-2xl">
            <button
                onClick={() => setMicActive(!isMicActive)}
                className={`flex items-center gap-3 px-6 py-3 rounded-full font-bold text-xs transition-all ${isMicActive
                        ? 'bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                disabled={!deepgramKey}
            >
                {connectionState === 'connecting' ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : isMicActive ? (
                    <MicOff size={16} />
                ) : (
                    <Mic size={16} />
                )}
                <span className="tracking-wide">
                    {connectionState === 'connecting' ? 'Connecting...' : isMicActive ? 'Agent Active' : 'Start Agent'}
                </span>
            </button>

            <div className="h-8 w-[1px] bg-white/10 mx-2"></div>

            <button
                onClick={handleSubmitCode}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-white/20"
            >
                <Play size={16} fill="currentColor" />
                Submit Solution
            </button>
        </div>
    );
};

export default Controls;
