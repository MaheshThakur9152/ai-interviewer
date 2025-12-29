import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Play, CheckCircle } from 'lucide-react';
import { useInterviewStore } from '../../store/useInterviewStore';

const Controls: React.FC = () => {
    const { isMicActive, setMicActive, code, setTerminalOutput, setEditorFrozen, addMessage, setAudioPlaying, messages } = useInterviewStore();
    const recognitionRef = useRef<any>(null);

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true; // Enable real-time feedback
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                // Show interim text as a "phantom" message if we wanted, 
                // but for now just logging to confirm it works. 
                // The 'isFinal' block handles the actual submission.

                if (interimTranscript) {
                    setTerminalOutput({ type: 'info', message: `Listening: ${interimTranscript}` });
                }

                if (finalTranscript.trim()) {
                    console.log("Final Input:", finalTranscript);
                    handleUserVoiceInput(finalTranscript);
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error:", event.error);
                let errorMsg = 'Voice recognition encountered an error.';

                if (event.error === 'not-allowed') {
                    errorMsg = 'Microphone access was denied. Please allow microphone permissions in your browser settings.';
                    setMicActive(false);
                } else if (event.error === 'no-speech') {
                    errorMsg = 'No speech detected. Please speak louder or check your microphone.';
                } else if (event.error === 'network') {
                    errorMsg = 'Network error. Please check your connection.';
                    setMicActive(false);
                }

                addMessage('assistant', errorMsg);
            };

            recognitionRef.current.onend = () => {
                if (isMicActive) {
                    try { recognitionRef.current.start(); } catch { }
                }
            };
        }
    }, []);

    // Handle Mic Toggle - Request permission explicitly
    useEffect(() => {
        const startRecognition = async () => {
            if (isMicActive) {
                try {
                    // Explicitly request permissions every time we start to ensure browser doesn't block
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

                    // Stop the stream immediately, we just needed the permission grant
                    stream.getTracks().forEach(track => track.stop());

                    try {
                        recognitionRef.current?.start();
                        console.log("Mic recognition started");
                    } catch (startError) {
                        // Only log if it's not the "already started" error
                        console.warn("Mic start warning:", startError);
                    }
                } catch (e) {
                    console.error("Mic permission/start failed:", e);
                    setMicActive(false);
                    addMessage('assistant', 'Microphone access denied. Please allow it in browser settings.');
                }
            } else {
                try { recognitionRef.current?.stop(); } catch (e) { console.error(e); }
            }
        };
        startRecognition();
    }, [isMicActive]);

    const handleUserVoiceInput = async (text: string) => {
        addMessage('user', text);
        await processAIResponse(text, code);
    };

    const processAIResponse = async (input: string, currentCode: string) => {
        setAudioPlaying(true); // Show visualizer
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    context: 'technical-interview',
                    code: currentCode
                })
            });
            const data = await res.json();

            addMessage('assistant', data.response);
            speakResponse(data.response);
        } catch (error) {
            console.error(error);
            addMessage('assistant', "I'm having trouble connecting to the neural net.");
            setAudioPlaying(false);
            throw error; // Propagate error
        }
    };

    const speakResponse = (text: string) => {
        setAudioPlaying(true);
        window.speechSynthesis.cancel(); // kill current

        const utterance = new SpeechSynthesisUtterance(text);

        // Voice Selection Logic
        const loadVoice = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                // Prefer "Google US English" or similar natural voices if available
                const preferredVoice = voices.find(v =>
                    v.name.includes('Google') && v.lang.includes('en-US'))
                    || voices.find(v => v.lang.includes('en-US'))
                    || voices[0];

                if (preferredVoice) utterance.voice = preferredVoice;
            }
        };

        loadVoice();
        // If voices aren't loaded yet, wait for them
        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = loadVoice;
        }

        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onend = () => {
            setAudioPlaying(false);
            console.log("TTS Finished");
        };

        utterance.onerror = (e) => {
            console.error("TTS Error:", e);
            setAudioPlaying(false);
        };

        console.log("Speaking:", text);
        try {
            window.speechSynthesis.speak(utterance);
        } catch (err) {
            console.error("Playback failed:", err);
            setAudioPlaying(false);
        }
    };

    const handleSubmitCode = async () => {
        setEditorFrozen(true);
        setTerminalOutput({ type: 'info', message: 'Submitting to AI Reviewer...' });

        try {
            await processAIResponse("I have submitted my solution. Please review it.", code);
            setTerminalOutput({ type: 'success', message: 'Review received from AI.' });
        } catch (e) {
            setTerminalOutput({ type: 'error', message: 'Failed to get review.' });
        } finally {
            setEditorFrozen(false);
        }
    };

    return (
        <div className="flex items-center gap-4 bg-black/60 backdrop-blur-xl border border-white/10 p-2 rounded-full shadow-2xl">
            <button
                onClick={() => setMicActive(!isMicActive)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full font-bold text-xs transition-all ${isMicActive ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30' : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
            >
                {isMicActive ? <MicOff size={16} /> : <Mic size={16} />}
                {isMicActive ? 'Stop Voice' : 'Start Voice'}
            </button>

            <div className="h-8 w-[1px] bg-white/10 mx-2"></div>

            <button
                onClick={handleSubmitCode}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
                <Play size={16} fill="currentColor" />
                Submit Solution
            </button>
        </div>
    );
};


export default Controls;
