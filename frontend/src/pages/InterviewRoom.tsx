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

const InterviewRoom: React.FC<InterviewRoomProps> = ({ onExit, onSignOut, user }) => {
    const { startSession, endSession, currentTopic, isMicActive, setMicActive, terminalOutput } = useInterviewStore();
    const [elapsed, setElapsed] = useState(0);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

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

    // Camera Logic - Request permission on mount
    useEffect(() => {
        if (isCameraOn && videoRef.current) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: false })
                .then(stream => {
                    if (videoRef.current) videoRef.current.srcObject = stream;
                })
                .catch(err => {
                    console.error("Camera permission denied:", err);
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

            {/* Top Bar */}
            <header className="h-16 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-6 shrink-0 z-20">
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
                    <span className="px-4 py-1.5 glass rounded-full text-xs font-bold uppercase tracking-widest text-purple-300 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                        {currentTopic || 'Technical Interview'}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={onExit} className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 text-xs font-bold rounded-lg transition-colors border border-red-600/20">
                        End Interview
                    </button>
                </div>
            </header>

            <main className="flex-1 flex gap-6 p-6 min-h-0 relative">

                {/* LEFT: MAIN IDE AREA (Replacing the big Video area from reference) */}
                <div className="flex-1 flex flex-col gap-4 min-w-0">
                    <div className="flex-1 relative rounded-[32px] overflow-hidden border border-white/10 shadow-2xl bg-[#1e1e1e] group">
                        <CodeEditor />

                        {/* Overlay Controls (Floating at bottom like reference) */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
                            <Controls />
                            {/* Note: Controls component has its own styles, we might need to adjust it to float nicely 
                               or just wrap it here. The current Controls is a full-width bar. 
                               We might want to CSS hack it to look floating or accept it as a bar.
                               For high fidelity, let's leave it as is for now, it acts as a bottom dock.
                           */}
                        </div>
                    </div>

                    {/* Subtitles / AI Status Area */}
                    <div className="h-20 glass rounded-2xl border border-white/5 flex items-center px-6 gap-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5" />
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 animate-pulse">
                            <Sparkles size={18} className="text-purple-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">AI Processor Status</p>
                            <p className="text-sm font-medium text-purple-200">
                                {terminalOutput?.message ? `Analysis: ${terminalOutput.message}` : "Listening to your solution..."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT: SIDEBAR (Chat + Stats + Camera) */}
                <div className="w-[400px] flex flex-col gap-4 shrink-0">

                    {/* User Camera PIP - Moved to Top Right of sidebar */}
                    <div className="h-48 rounded-3xl overflow-hidden relative border border-white/10 bg-black shadow-lg">
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
                        <div className="absolute top-3 right-3 flex gap-2">
                            <button onClick={() => setIsCameraOn(!isCameraOn)} className="p-1.5 bg-black/50 hover:bg-white/10 rounded-lg text-white transition-colors">
                                {isCameraOn ? <Video size={14} /> : <VideoOff size={14} />}
                            </button>
                        </div>
                    </div>

                    {/* Stats Radar */}
                    <div className="h-56 glass rounded-[32px] border border-white/5 p-4 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-2 px-2">
                            <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                <BarChart2 size={14} className="text-purple-500" />
                                Live Performance
                            </h3>
                            <Info size={12} className="text-gray-600" />
                        </div>
                        <div className="h-40 w-full relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                                    <PolarGrid stroke="#333" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#888' }} />
                                    <Radar name="Candidate" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 glass rounded-[32px] border border-white/5 flex flex-col overflow-hidden min-h-0">
                        <div className="p-4 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                <MessageSquare size={14} className="text-blue-500" />
                                Transcript
                            </h3>
                            <span className="text-[9px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded font-bold uppercase">Sync Active</span>
                        </div>
                        <ChatInterface />
                    </div>

                </div>

            </main>
        </div>
    );
};

export default InterviewRoom;
