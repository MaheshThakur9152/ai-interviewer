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
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[event.results.length - 1][0].transcript;
                console.log("Voice input received:", transcript);
                if (transcript.trim()) {
                    handleUserVoiceInput(transcript);
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
                    // Request mic permission via getUserMedia first
                    await navigator.mediaDevices.getUserMedia({ audio: true });
                    recognitionRef.current?.start();
                } catch (e) {
                    console.error("Mic permission denied:", e);
                    setMicActive(false);
                    addMessage('assistant', 'Please allow microphone access to use voice features.');
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

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => {
            setAudioPlaying(false);
            console.log("Speech synthesis completed");
        };
        utterance.onerror = (error) => {
            console.error("Speech synthesis error:", error);
            setAudioPlaying(false);
        };
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0; // Max volume

        // Select a good voice if available
        const voices = window.speechSynthesis.getVoices();
        const englishVoice = voices.find(v => v.lang.includes('en-US') || v.lang.includes('en-GB'));
        if (englishVoice) {
            utterance.voice = englishVoice;
        }

        console.log("Starting speech synthesis...");
        window.speechSynthesis.speak(utterance);
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
