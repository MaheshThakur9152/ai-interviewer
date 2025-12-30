import React, { useState, useEffect, useRef } from 'react';
import {
    Mic, MicOff, Video, VideoOff, PhoneOff,
    MessageSquare, BarChart2, Clock,
    Sparkles, Info, Code2, Terminal
} from 'lucide-react';
import {
    Radar, RadarChart, PolarGrid,
    PolarAngleAxis, ResponsiveContainer
} from 'recharts';
import { useInterviewStore } from '../store/useInterviewStore';
import CodeEditor from '../components/Interview/CodeEditor';
import Controls from '../components/Interview/Controls';
import ChatInterface from '../components/Interview/ChatInterface'; // We might want to use the store's chat but styled better
import { dsaQuestions } from '../data/dsaQuestions';
// We'll use the Controls component but maybe hide its default UI and trigger it via the new buttons?
// Actually simpler to just reuse the logic or keep Controls as the functional head.
// Let's rely on Controls logic but render our own UI buttons if possible,
// OR just embed Controls as the bottom bar if it looks good.
// The reference has floating controls. Let's try to replicate the reference.

interface InterviewRoomProps {
    onExit: () => void;
    onSignOut?: () => void;
    user?: any;
}

// Local mock data removed to use imported dsaQuestions


const InterviewRoom: React.FC<InterviewRoomProps> = ({ onExit, onSignOut, user }) => {
    const { startSession, endSession, currentTopic, isMicActive, setMicActive, terminalOutput } = useInterviewStore();
    const [elapsed, setElapsed] = useState(0);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    const [activeTab, setActiveTab] = useState<'problem' | 'chat' | 'stats'>('problem');
    const [activeQuestion, setActiveQuestion] = useState(dsaQuestions[0]); // Default to first

    // Mock Stats Data
    const radarData = [
        { subject: 'Code Quality', A: 85, fullMark: 100 },
        { subject: 'Optimality', A: 70, fullMark: 100 },
        { subject: 'Speed', A: 90, fullMark: 100 },
        { subject: 'Bug Free', A: 65, fullMark: 100 },
        { subject: 'Communication', A: 75, fullMark: 100 },
    ];

    useEffect(() => {
        // Ensure session is active if not already
        if (!currentTopic) startSession("DSA - Arrays & Hashing");

        const timer = setInterval(() => setElapsed(e => e + 1), 1000);
        return () => {
            clearInterval(timer);
            // endSession(); // Don't auto-end on unmount to prevent accidental loss on refresh? 
            // Actually the store persistence handles refresh state ideally, but we can restart timer.
        };
    }, []);

    useEffect(() => {
        // Find question if topic matches, else default
        const found = dsaQuestions.find(q => currentTopic?.includes(q.title));
        if (found) setActiveQuestion(found);
    }, [currentTopic]);

    // Camera Logic - Request permission on mount
    useEffect(() => {
        if (isCameraOn && videoRef.current) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: false })
                .then(stream => {
                    if (videoRef.current) videoRef.current.srcObject = stream;
                })
                .catch(err => {
                    // Suppress error if camera not found, just set visual state to off
                    setIsCameraOn(false);
                });
        } else if (!isCameraOn && videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream?.getTracks().forEach(t => t.stop());
            if (videoRef.current) videoRef.current.srcObject = null;
        }
    }, [isCameraOn]);

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="h-screen bg-[#050505] text-white flex flex-col overflow-hidden font-sans selection:bg-purple-500/30">
            {/* Background Gradients */}
            <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[128px] pointer-events-none" />
            <div className="fixed bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[128px] pointer-events-none" />

            {/* Top Bar */}
            <header className="h-16 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 rounded-full border border-red-500/20">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-red-400 tracking-wider">LIVE SESSION</span>
                    </div>
                    <div className="h-4 w-[1px] bg-white/10" />
                    <div className="flex items-center gap-2 text-gray-400 font-mono text-sm">
                        <Clock size={14} />
                        {formatTime(elapsed)}
                    </div>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
                    <span className="px-5 py-2 glass rounded-xl text-xs font-bold uppercase tracking-widest text-purple-300 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)] flex items-center gap-2">
                        <Code2 size={14} />
                        {activeQuestion.title}
                    </span>
                </div>

                <button onClick={onExit} className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 text-xs font-bold rounded-lg transition-colors border border-red-600/20">
                    End Interview
                </button>
            </header>

            <main className="flex-1 flex gap-6 p-6 min-h-0 relative z-10">

                {/* LEFT: MAIN IDE AREA */}
                <div className="flex-1 flex flex-col gap-4 min-w-0">
                    <div className="flex-1 relative rounded-[24px] overflow-hidden border border-white/10 shadow-2xl bg-[#1e1e1e] group">
                        <CodeEditor />

                        {/* Overlay Controls */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-auto">
                            <Controls />
                        </div>
                    </div>

                    {/* AI Status Area - Dynamic Voice Visualizer */}
                    <div className="h-16 glass rounded-xl border border-white/5 flex items-center px-6 justify-between relative overflow-hidden shrink-0 transition-all duration-500">
                        {/* Background Pulse Effect when AI Speaking */}
                        <div className={`absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 transition-opacity duration-500 ${terminalOutput?.type === 'info' || isMicActive ? 'opacity-100' : 'opacity-0'}`} />

                        <div className="flex items-center gap-4 relative z-10 w-full">
                            {/* Visualizer Icon */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${isMicActive ? 'bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-purple-500/10'}`}>
                                {isMicActive ? (
                                    <div className="flex gap-[2px] items-center h-4">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i}
                                                className="w-[3px] bg-red-400 rounded-full animate-pulse"
                                                style={{ height: `${Math.random() * 12 + 4}px`, animationDuration: `${0.5 + Math.random() * 0.5}s` }}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <Sparkles size={18} className="text-purple-400" />
                                )}
                            </div>

                            <div className="flex flex-col overflow-hidden w-full">
                                <div className="flex justify-between items-center">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest shrink-0 mb-0.5">
                                        {isMicActive ? 'LISTENING TO CANDIDATE' : 'AI ASSISTANT STANDBY'}
                                    </p>
                                    {/* Fake Waveform when AI is "thinking" or "speaking" (simulated by terminal output updates) */}
                                    {terminalOutput?.type === 'info' && (
                                        <div className="flex items-center gap-0.5 h-3">
                                            {[...Array(12)].map((_, i) => (
                                                <div key={i} className="w-[2px] bg-purple-500 rounded-full animate-[bounce_1s_infinite]" style={{ animationDelay: `${i * 0.05}s` }} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm font-medium text-purple-200 truncate font-mono">
                                    {terminalOutput?.message || "ready for your input..."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: SIDEBAR (Tabs) */}
                <div className="w-[400px] flex flex-col gap-4 shrink-0 bg-[#0a0a0a]/50 backdrop-blur rounded-[24px] border border-white/5 p-2">

                    {/* User Camera PIP */}
                    <div className="h-48 rounded-2xl overflow-hidden relative border border-white/10 bg-black shadow-lg shrink-0 group">
                        {isCameraOn ? (
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover -scale-x-100" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                                <VideoOff />
                            </div>
                        )}
                        <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 backdrop-blur rounded text-[9px] font-bold uppercase tracking-wider text-white">
                            Candidate Feed
                        </div>
                        <button onClick={() => setIsCameraOn(!isCameraOn)} className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-white/10 rounded-lg text-white transition-colors opacity-0 group-hover:opacity-100">
                            {isCameraOn ? <Video size={14} /> : <VideoOff size={14} />}
                        </button>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex bg-white/5 p-1 rounded-xl">
                        {(['problem', 'chat', 'stats'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === tab
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 glass rounded-2xl border border-white/5 overflow-hidden relative flex flex-col min-h-0">

                        {activeTab === 'problem' && (
                            <div className="flex-1 p-6 overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-white">{activeQuestion.title}</h2>
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${activeQuestion.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                                        activeQuestion.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-red-500/20 text-red-400'
                                        }`}>
                                        {activeQuestion.difficulty}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                    {activeQuestion.description}
                                </p>

                                <div className="space-y-4">
                                    {activeQuestion.example && (
                                        <div className="p-4 bg-white/5 rounded-xl border border-white/5 shadow-inner">
                                            <h3 className="text-[10px] font-bold text-blue-300 mb-2 uppercase tracking-wider flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                Example Test Case
                                            </h3>
                                            <div className="bg-[#0f0f0f] p-3 rounded-lg border border-white/5 font-mono text-[11px] text-gray-400">
                                                <div className="mb-1"><span className="text-purple-400">Input:</span> {activeQuestion.example.input}</div>
                                                <div className="mb-1"><span className="text-green-400">Output:</span> {activeQuestion.example.output}</div>
                                                {activeQuestion.example.explanation && (
                                                    <div className="text-gray-500 italic mt-2 border-t border-white/5 pt-2">
                                                        // {activeQuestion.example.explanation}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {activeQuestion.constraints && (
                                        <div className="p-4 bg-white/5 rounded-xl border border-white/5 shadow-inner">
                                            <h3 className="text-[10px] font-bold text-yellow-300 mb-2 uppercase tracking-wider flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                                                Constraints
                                            </h3>
                                            <ul className="list-disc list-inside text-[11px] font-mono text-gray-400 space-y-1 ml-1">
                                                {activeQuestion.constraints.map((c: string, i: number) => (
                                                    <li key={i}>{c}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {!activeQuestion.example && !activeQuestion.constraints && (
                                        <div className="p-8 text-center border-2 border-dashed border-white/10 rounded-xl">
                                            <p className="text-gray-600 text-xs">No detailed examples available for this problem.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'chat' && (
                            <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="p-3 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Transcript History</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                </div>
                                <ChatInterface />
                            </div>
                        )}

                        {activeTab === 'stats' && (
                            <div className="flex-1 p-4 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="w-full h-64 relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                            <PolarGrid stroke="#333" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#888' }} />
                                            <Radar name="Candidate" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="text-center mt-4">
                                    <p className="text-2xl font-bold text-white">78/100</p>
                                    <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Overall Performace Score</p>
                                </div>
                            </div>
                        )}

                    </div>

                </div>

            </main>
        </div>
    );
};

export default InterviewRoom;
