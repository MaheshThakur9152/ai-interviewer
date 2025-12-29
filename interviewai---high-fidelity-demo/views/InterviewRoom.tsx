
import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, 
  Video, VideoOff, 
  PhoneOff, 
  MessageSquare,
  BarChart2,
  Clock,
  Send,
  Loader2,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
} from 'recharts';
import { getAIInterviewerResponse } from '../geminiService';
import { ChatMessage, InterviewData } from '../types';

interface InterviewRoomProps {
  onComplete: (data: InterviewData) => void;
}

const InterviewRoom: React.FC<InterviewRoomProps> = ({ onComplete }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'ai', text: 'Hello! I am your AI interviewer today. Are you ready to begin your mock interview for the UI/UX Designer position?', timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [timer, setTimer] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Stats mock data
  const radarData = [
    { subject: 'Communication', A: 85, fullMark: 100 },
    { subject: 'Confidence', A: 70, fullMark: 100 },
    { subject: 'Technical', A: 90, fullMark: 100 },
    { subject: 'Structure', A: 65, fullMark: 100 },
    { subject: 'Depth', A: 75, fullMark: 100 },
  ];

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isCameraOn && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => { if (videoRef.current) videoRef.current.srcObject = stream; })
        .catch(err => console.error("Camera access denied", err));
    } else if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  }, [isCameraOn]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isProcessing) return;

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userInput,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    setMessages(prev => [...prev, newUserMsg]);
    setUserInput('');
    setIsProcessing(true);

    // Prepare history for Gemini
    const history = messages.map(m => ({
      role: m.sender === 'ai' ? 'model' : 'user' as const,
      parts: [{ text: m.text }]
    }));
    history.push({ role: 'user', parts: [{ text: userInput }] });

    const aiResponse = await getAIInterviewerResponse('UI/UX Designer', history);

    const newAiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      text: aiResponse || "That's interesting. Can you tell me more?",
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    setMessages(prev => [...prev, newAiMsg]);
    setIsProcessing(false);
  };

  const endInterview = () => {
    // Collect session data and pass back to parent
    const result: InterviewData = {
      roleName: 'UI/UX Designer',
      companyName: 'TechFlow Solutions',
      startTime: Date.now() - (timer * 1000),
      messages,
      scores: {
        communication: 82,
        confidence: 75,
        technical: 88,
        structure: 64,
        depth: 71
      }
    };
    onComplete(result);
  };

  return (
    <div className="h-full flex flex-col gap-6 max-w-[1600px] mx-auto animate-in zoom-in duration-500">
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Left: Video Area */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="bg-red-500 w-3 h-3 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-slate-900 tracking-tight">LIVE RECORDING</span>
              <div className="h-4 w-[1px] bg-slate-300 mx-2"></div>
              <div className="flex items-center gap-1.5 text-slate-500 font-medium text-sm">
                <Clock size={16} />
                {formatTime(timer)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider">UI/UX Designer Mock</span>
            </div>
          </div>

          <div className="relative flex-1 bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
            {/* Main AI Feed Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
              <img 
                src="https://picsum.photos/seed/interviewer/800/600" 
                alt="AI Interviewer" 
                className="w-full h-full object-cover opacity-60 grayscale-[40%]" 
              />
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
                <div className="px-6 py-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-white font-medium flex items-center gap-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className={`w-1 bg-indigo-400 rounded-full animate-bounce`} style={{ height: `${Math.random() * 20 + 10}px`, animationDelay: `${i * 0.1}s` }}></div>
                    ))}
                  </div>
                  AI is listening...
                </div>
              </div>
            </div>

            {/* User PIP Feed */}
            <div className="absolute top-6 right-6 w-48 h-64 bg-slate-700 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/30 z-20 transition-all hover:scale-105 group">
              {isCameraOn ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                  <VideoOff size={32} />
                </div>
              )}
              <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur px-2 py-1 rounded-lg text-[10px] text-white font-bold tracking-wider">YOU (CANDIDATE)</div>
            </div>

            {/* Floating Controls */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30">
              <button 
                onClick={() => setIsMicOn(!isMicOn)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl ${isMicOn ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-red-500 text-white'}`}
              >
                {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
              </button>
              <button 
                onClick={() => setIsCameraOn(!isCameraOn)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl ${isCameraOn ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-red-500 text-white'}`}
              >
                {isCameraOn ? <Video size={24} /> : <VideoOff size={24} />}
              </button>
              <button 
                onClick={endInterview}
                className="bg-red-500 hover:bg-red-600 text-white h-14 px-8 rounded-2xl font-bold shadow-xl shadow-red-500/30 flex items-center gap-3 transition-all active:scale-95"
              >
                <PhoneOff size={20} />
                End Session
              </button>
            </div>
          </div>

          {/* Subtitles / Transcription */}
          <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-slate-200 flex items-center gap-6 min-h-[100px] shadow-sm">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
              <Sparkles size={24} className="animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                Live Analysis
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              </p>
              <p className="text-slate-700 italic">
                {isProcessing ? "AI is generating feedback..." : "Analysis active: Maintaining good eye contact. Voice clarity is optimal. Keep it up!"}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Panels (Chat & Scoring) */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6 h-full">
          {/* Real-time Scoring */}
          <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex flex-col min-h-0 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <BarChart2 size={18} className="text-indigo-600" />
                Live Skill Pulse
              </h3>
              <Info size={16} className="text-slate-300" />
            </div>
            <div className="h-[200px] w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{fontSize: 10, fill: '#64748b'}} />
                  <Radar
                    name="Candidate"
                    dataKey="A"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                  <span>CONFIDENCE</span>
                  <span className="text-indigo-600">70%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full">
                  <div className="bg-indigo-500 h-1.5 rounded-full w-[70%] shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                  <span>TECHNICAL ACCURACY</span>
                  <span className="text-indigo-600">90%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full">
                  <div className="bg-emerald-500 h-1.5 rounded-full w-[90%] shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Transcript Panel */}
          <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex flex-col min-h-0 flex-1 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare size={18} className="text-indigo-600" />
                Transcript
              </h3>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">LIVE SYNC</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 px-2 custom-scrollbar mb-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100 shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 font-medium">{msg.timestamp}</span>
                </div>
              ))}
              {isProcessing && (
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium animate-pulse">
                  <Loader2 size={14} className="animate-spin" />
                  AI is thinking...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="relative pt-4 border-t border-slate-100">
              <textarea 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your response..."
                className="w-full bg-slate-50 border-none rounded-2xl p-4 pr-12 text-sm focus:ring-2 focus:ring-indigo-500 resize-none min-h-[60px]"
              />
              <button 
                onClick={handleSendMessage}
                disabled={isProcessing || !userInput.trim()}
                className="absolute bottom-4 right-3 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-200"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;
