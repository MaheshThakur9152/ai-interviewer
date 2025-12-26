
import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, 
  Sparkles, MessageSquare, Layout, 
  Search, Send, X, Users, Share2, 
  Maximize2, Settings, Brain, Image as ImageIcon,
  Zap, Download, Circle, Square, UserPlus, UserX, MoreVertical,
  Volume2, Type as TypeIcon, MousePointer2, Trash2, Undo, Redo, LogOut
} from 'lucide-react';
import Logo from './Logo';

interface CanvasElement {
  id: string;
  type: 'circle' | 'square' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  color: string;
}

interface Participant {
  id: string;
  name: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isSpeaking?: boolean;
  isHost?: boolean;
  type: 'video' | 'image';
  source: string;
}

interface MeetingRoomProps {
  onExit: () => void;
  onSignOut?: () => void;
}

const MeetingRoom: React.FC<MeetingRoomProps> = ({ onExit, onSignOut }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showAISidebar, setShowAISidebar] = useState(true);
  const [showCanvas, setShowCanvas] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'memory' | 'people'>('chat');
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{id: string, user: string, message: string, timestamp: Date}>>([]);
  const [chatInput, setChatInput] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const meetingId = 'demo-meeting'; // For demo, use a fixed ID
  
  // Audio Feedback Logic
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playSound = (type: 'click' | 'toggleOn' | 'toggleOff' | 'notify' | 'exit' | 'sparkle') => {
    initAudio();
    const ctx = audioCtxRef.current!;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'click':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      case 'toggleOn':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      case 'toggleOff':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      case 'notify':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      case 'exit':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.3);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      case 'sparkle':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(2400, now + 0.05);
        osc.frequency.exponentialRampToValueAtTime(1800, now + 0.1);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
    }
  };

  // Socket.IO connection
  useEffect(() => {
    socketRef.current = io('http://localhost:5000');
    const socket = socketRef.current;

    socket.emit('join-meeting', meetingId);

    socket.on('receive-message', (data: {user: string, message: string, timestamp: Date}) => {
      setChatMessages(prev => [...prev, { ...data, id: Date.now().toString() }]);
    });

    return () => {
      socket.emit('leave-meeting', meetingId);
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const messageData = {
      meetingId,
      user: 'You', // In real app, get from user state
      message: chatInput,
      timestamp: new Date()
    };
    socketRef.current?.emit('send-message', messageData);
    setChatMessages(prev => [...prev, { ...messageData, id: Date.now().toString() }]);
    setChatInput('');
  };

  // Canvas State
  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([]);
  const [history, setHistory] = useState<CanvasElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [activeTool, setActiveTool] = useState<'none' | 'circle' | 'square' | 'text'>('none');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<CanvasElement | null>(null);
  const canvasRef = useRef<SVGSVGElement>(null);

  const [participants, setParticipants] = useState<Participant[]>([
    { 
      id: '1', name: 'Alex Rivera', isMuted: false, isVideoOn: true, isSpeaking: true, isHost: true, 
      type: 'video', source: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-sitting-at-a-desk-working-at-a-laptop-41221-large.mp4' 
    },
    { 
      id: '2', name: 'Sarah Chen', isMuted: true, isVideoOn: true, isSpeaking: false,
      type: 'image', source: 'https://picsum.photos/seed/sarah/800/600' 
    },
    { 
      id: '3', name: 'Marcus Aurelius', isMuted: false, isVideoOn: false, isSpeaking: false,
      type: 'image', source: 'https://picsum.photos/seed/marcus/800/600' 
    },
    { 
      id: '4', name: 'Dr. Elena Vance', isMuted: false, isVideoOn: true, isSpeaking: false,
      type: 'image', source: 'https://picsum.photos/seed/elena/800/600' 
    }
  ]);

  // Simulate speaking indicator randomly
  useEffect(() => {
    const interval = setInterval(() => {
      setParticipants(prev => prev.map(p => {
        if (p.isMuted) return { ...p, isSpeaking: false };
        const chance = p.id === '1' ? 0.3 : 0.05;
        return { ...p, isSpeaking: Math.random() < chance };
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const [transcript] = useState<string[]>([
    "Alex: Welcome everyone to the Q3 strategy sync.",
    "Sarah: Thanks Alex. I've prepared the architectural overview.",
    "Marcus: Excited to see it. Let's look at the branding.",
    "Alex: Aether AI, summarize our last week's ideas."
  ]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<number | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  const showToast = (msg: string) => {
    setNotification(msg);
    playSound('notify');
    setTimeout(() => setNotification(null), 3000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const commitToHistory = (newElements: CanvasElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCanvasElements(newElements);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setCanvasElements(history[prevIndex]);
      playSound('click');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setCanvasElements(history[nextIndex]);
      playSound('click');
    }
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (activeTool === 'none') return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'text') {
      const textValue = window.prompt("Enter annotation text:");
      if (textValue) {
        const newEl: CanvasElement = {
          id: Date.now().toString(),
          type: 'text',
          x,
          y,
          width: 0,
          height: 0,
          text: textValue,
          color: '#a78bfa'
        };
        commitToHistory([...canvasElements, newEl]);
        playSound('click');
      }
      setActiveTool('none');
      return;
    }

    setIsDrawing(true);
    setCurrentElement({
      id: Date.now().toString(),
      type: activeTool as 'circle' | 'square',
      x,
      y,
      width: 0,
      height: 0,
      color: '#a78bfa'
    });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing || !currentElement) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentElement(prev => prev ? ({
      ...prev,
      width: x - prev.x,
      height: y - prev.y
    }) : null);
  };

  const handleMouseUp = () => {
    if (isDrawing && currentElement) {
      commitToHistory([...canvasElements, currentElement]);
      playSound('click');
    }
    setIsDrawing(false);
    setCurrentElement(null);
  };

  const clearCanvas = () => {
    commitToHistory([]);
    playSound('exit');
    showToast("Canvas cleared");
  };

  const toggleParticipantMute = (id: string) => {
    setParticipants(prev => prev.map(p => {
      if (p.id === id) {
        const nextState = !p.isMuted;
        playSound(nextState ? 'toggleOff' : 'toggleOn');
        return { ...p, isMuted: nextState, isSpeaking: false };
      }
      return p;
    }));
  };

  const toggleParticipantVideo = (id: string) => {
    setParticipants(prev => prev.map(p => {
      if (p.id === id) {
        const nextState = !p.isVideoOn;
        playSound(nextState ? 'toggleOn' : 'toggleOff');
        return { ...p, isVideoOn: nextState };
      }
      return p;
    }));
  };

  const removeParticipant = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
    playSound('exit');
    showToast("Participant removed");
  };

  const inviteParticipant = () => {
    navigator.clipboard.writeText("https://aether.ai/meet/sync-123");
    playSound('notify');
    showToast("Invite link copied");
  };

  return (
    <div className="fixed inset-0 bg-[#050505] flex flex-col overflow-hidden text-white font-sans">
      <style>{`
        @keyframes speaking-pulse {
          0% { box-shadow: 0 0 0 0 rgba(167, 139, 250, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(167, 139, 250, 0); }
          100% { box-shadow: 0 0 0 0 rgba(167, 139, 250, 0); }
        }
        .animate-speaking {
          animation: speaking-pulse 2s infinite;
        }
        .min-h-0 { min-height: 0; }
        .canvas-container svg {
          touch-action: none;
        }
      `}</style>
      
      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 duration-300">
          <div className="glass px-6 py-3 rounded-2xl border-purple-500/30 text-xs font-bold shadow-2xl flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-purple-400" />
            {notification}
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Stage Area */}
        <div className={`flex-1 relative flex flex-col transition-all duration-500 min-h-0 ${showAISidebar ? 'mr-96' : ''}`}>
          
          {/* Header */}
          <header className="h-16 px-8 flex justify-between items-center z-50 bg-[#050505]/50 backdrop-blur-md border-b border-white/5 shrink-0">
            <div className="flex gap-4 items-center">
              <Logo size={28} glow={false} />
              <div className="glass px-4 py-1.5 rounded-full flex items-center gap-3 border-white/5">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-bold tracking-widest uppercase opacity-70">Room: Strategy Sync</span>
              </div>
              {isRecording && (
                <div className="bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-bold font-mono text-red-500">REC {formatTime(recordingTime)}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
               <button 
                onClick={() => { setActiveTab('people'); setShowAISidebar(true); playSound('click'); }} 
                className="glass px-3 py-1.5 rounded-full flex items-center gap-2 hover:bg-white/5 border-white/5 transition-all active:scale-95"
               >
                 <Users size={14} className="text-purple-400" />
                 <span className="text-[10px] font-bold">{participants.length}</span>
               </button>
            </div>
          </header>

          {/* Dynamic Content Stage */}
          <div className="flex-1 flex p-6 gap-6 min-h-0 overflow-hidden">
            
            {/* Left: Participants Grid (Fluid) */}
            <div className={`flex-1 grid gap-4 transition-all duration-500 min-h-0 ${
              participants.length <= 1 ? 'grid-cols-1' : 
              participants.length <= 2 || (showCanvas && participants.length <= 4) ? 'grid-cols-1 md:grid-cols-2' : 
              'grid-cols-2 md:grid-cols-3'
            }`}>
              {participants.map((p) => (
                <div 
                  key={p.id} 
                  className={`relative rounded-3xl overflow-hidden border bg-[#111] shadow-2xl group transition-all duration-500 ${
                    p.isSpeaking 
                      ? 'border-purple-500 shadow-[0_0_40px_rgba(167,139,250,0.3)] scale-[1.01]' 
                      : 'border-white/5'
                  }`}
                >
                  {p.type === 'video' ? (
                    <video autoPlay muted loop playsInline className={`w-full h-full object-cover transition-all duration-700 ${p.isVideoOn && !p.isSpeaking ? 'blur-[1px] opacity-80' : 'blur-0'}`}>
                      <source src={p.source} type="video/mp4" />
                    </video>
                  ) : (
                    <img src={p.source} className={`w-full h-full object-cover transition-all duration-700 ${p.isVideoOn && !p.isSpeaking ? 'blur-[1px] opacity-80' : 'blur-0'}`} alt={p.name} />
                  )}
                  {!p.isVideoOn && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
                      <div className={`w-16 h-16 rounded-full border flex items-center justify-center text-xl font-space font-bold transition-all duration-500 ${
                        p.isSpeaking ? 'bg-purple-500/20 border-purple-500 text-purple-400 scale-110 shadow-lg' : 'bg-white/5 border-white/10 text-purple-500'
                      }`}>
                        {p.name.charAt(0)}
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <div className={`glass px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-wider flex items-center gap-2 border-white/10 transition-all duration-300 ${
                      p.isSpeaking ? 'bg-purple-500/30 border-purple-500/50' : ''
                    }`}>
                      {p.isMuted && <MicOff size={10} className="text-red-500" />}
                      {p.isSpeaking && !p.isMuted && <Volume2 size={10} className="text-purple-400 animate-pulse" />}
                      {p.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Vertical Creative Canvas (Appears on Toggle) */}
            <div className={`h-full transition-all duration-700 ease-out overflow-hidden flex flex-col ${showCanvas ? 'w-[420px] opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}>
               <div className="h-full glass rounded-[32px] border-purple-500/30 bg-[#0a0a0a]/90 backdrop-blur-3xl flex flex-col shadow-2xl overflow-hidden">
                  {/* Vertical Canvas Header */}
                  <div className="px-5 py-3.5 flex justify-between items-center border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-400" />
                      <span className="text-[10px] font-space font-bold uppercase tracking-widest opacity-80">AI Workspace</span>
                    </div>
                    <button onClick={() => { setShowCanvas(false); playSound('toggleOff'); }} className="p-1.5 hover:bg-white/10 rounded-lg transition-all active:scale-75"><X size={16} /></button>
                  </div>
                  
                  {/* Drawing Area & Tools */}
                  <div className="flex-1 p-5 flex flex-col gap-4 min-h-0 overflow-hidden">
                    {/* Floating Toolbar Inside Canvas Floor */}
                    <div className="flex justify-center shrink-0">
                      <div className="flex items-center gap-1 bg-black/60 rounded-2xl p-1.5 border border-white/10 shadow-2xl">
                         <button onClick={() => { setActiveTool('none'); playSound('click'); }} className={`p-2 rounded-xl transition-all ${activeTool === 'none' ? 'bg-purple-600 text-white shadow-lg' : 'hover:bg-white/5 text-gray-500'}`} title="Pointer Mode"><MousePointer2 size={14} /></button>
                         <button onClick={() => { setActiveTool('square'); playSound('click'); }} className={`p-2 rounded-xl transition-all ${activeTool === 'square' ? 'bg-purple-600 text-white shadow-lg' : 'hover:bg-white/5 text-gray-500'}`} title="Draw Square"><Square size={14} /></button>
                         <button onClick={() => { setActiveTool('circle'); playSound('click'); }} className={`p-2 rounded-xl transition-all ${activeTool === 'circle' ? 'bg-purple-600 text-white shadow-lg' : 'hover:bg-white/5 text-gray-500'}`} title="Draw Circle"><Circle size={14} /></button>
                         <button onClick={() => { setActiveTool('text'); playSound('click'); }} className={`p-2 rounded-xl transition-all ${activeTool === 'text' ? 'bg-purple-600 text-white shadow-lg' : 'hover:bg-white/5 text-gray-500'}`} title="Add Text"><TypeIcon size={14} /></button>
                         <div className="h-5 w-px bg-white/10 mx-1" />
                         <button onClick={handleUndo} disabled={historyIndex === 0} className={`p-2 rounded-xl transition-all ${historyIndex > 0 ? 'hover:bg-white/5 text-gray-300' : 'opacity-20 cursor-not-allowed'}`} title="Undo"><Undo size={14} /></button>
                         <button onClick={clearCanvas} className="p-2 rounded-xl hover:bg-red-500/20 text-gray-500 hover:text-red-500 transition-colors" title="Clear Canvas"><Trash2 size={14} /></button>
                      </div>
                    </div>

                    <div className="flex-1 glass rounded-2xl border-white/5 bg-black/60 relative flex items-center justify-center overflow-hidden canvas-container group/canvas min-h-0 shadow-inner">
                      
                      <svg 
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full z-10 cursor-crosshair"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                      >
                        {canvasElements.map(el => (
                          <g key={el.id}>
                            {el.type === 'square' && (
                              <rect 
                                x={el.width < 0 ? el.x + el.width : el.x} 
                                y={el.height < 0 ? el.y + el.height : el.y} 
                                width={Math.abs(el.width)} 
                                height={Math.abs(el.height)} 
                                fill="none" 
                                stroke={el.color} 
                                strokeWidth="2.5" 
                                rx="4"
                                style={{ filter: 'drop-shadow(0 0 4px rgba(167, 139, 250, 0.4))' }}
                              />
                            )}
                            {el.type === 'circle' && (
                              <ellipse 
                                cx={el.x + el.width / 2} 
                                cy={el.y + el.height / 2} 
                                rx={Math.abs(el.width / 2)} 
                                ry={Math.abs(el.height / 2)} 
                                fill="none" 
                                stroke={el.color} 
                                strokeWidth="2.5"
                                style={{ filter: 'drop-shadow(0 0 4px rgba(167, 139, 250, 0.4))' }}
                              />
                            )}
                            {el.type === 'text' && (
                              <text 
                                x={el.x} 
                                y={el.y} 
                                fill={el.color} 
                                className="text-xs font-space font-bold pointer-events-none select-none" 
                                dominantBaseline="middle"
                                style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8))' }}
                              >
                                {el.text}
                              </text>
                            )}
                          </g>
                        ))}
                        
                        {/* Dynamic Preview Layer */}
                        {isDrawing && currentElement && (
                          <g opacity="0.6">
                            {currentElement.type === 'square' && (
                              <rect 
                                x={currentElement.width < 0 ? currentElement.x + currentElement.width : currentElement.x} 
                                y={currentElement.height < 0 ? currentElement.y + currentElement.height : currentElement.y} 
                                width={Math.abs(currentElement.width)} 
                                height={Math.abs(currentElement.height)} 
                                fill="none" 
                                stroke={currentElement.color} 
                                strokeWidth="2" 
                                strokeDasharray="5 5"
                                rx="4" 
                              />
                            )}
                            {currentElement.type === 'circle' && (
                              <ellipse 
                                cx={currentElement.x + currentElement.width / 2} 
                                cy={currentElement.y + currentElement.height / 2} 
                                rx={Math.abs(currentElement.width / 2)} 
                                ry={Math.abs(currentElement.height / 2)} 
                                fill="none" 
                                stroke={currentElement.color} 
                                strokeWidth="2" 
                                strokeDasharray="5 5" 
                              />
                            )}
                          </g>
                        )}
                      </svg>

                      {canvasElements.length === 0 && (
                        <div className="text-center opacity-20 pointer-events-none p-6 transform transition-transform group-hover/canvas:scale-105 duration-1000">
                          <ImageIcon size={32} className="mx-auto mb-3" />
                          <p className="text-[9px] font-bold uppercase tracking-[0.2em] leading-relaxed">Vertical Workspace Active<br/>Materialize visions below</p>
                        </div>
                      )}
                      
                    </div>
                    
                  </div>
               </div>
            </div>
          </div>

          {/* Control Dock (Stage Bottom) */}
          <div className="h-24 flex items-center justify-center z-[60] relative shrink-0">
             <div className="glass px-6 py-3 rounded-[32px] flex items-center gap-3 shadow-2xl border-white/10 backdrop-blur-3xl bg-black/40">
                <button onClick={() => { setIsMuted(!isMuted); playSound(!isMuted ? 'toggleOff' : 'toggleOn'); }} className={`p-3.5 rounded-2xl transition-all active:scale-90 ${isMuted ? 'bg-red-500 text-white' : 'hover:bg-white/5 text-gray-400'}`} title="Mute Microphone"><Mic size={18} /></button>
                <button onClick={() => { setIsVideoOn(!isVideoOn); playSound(!isVideoOn ? 'toggleOn' : 'toggleOff'); }} className={`p-3.5 rounded-2xl transition-all active:scale-90 ${!isVideoOn ? 'bg-red-500 text-white' : 'hover:bg-white/5 text-gray-400'}`} title="Toggle Video"><Video size={18} /></button>
                <div className="w-px h-6 bg-white/10 mx-1" />
                <button onClick={() => { setIsRecording(!isRecording); playSound(!isRecording ? 'toggleOn' : 'toggleOff'); }} className={`p-3.5 rounded-2xl transition-all active:scale-90 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-white/5 text-gray-400'}`} title="Toggle Recording">{isRecording ? <Square size={18} fill="currentColor" /> : <Circle size={18} fill="currentColor" />}</button>
                <button onClick={() => { setShowCanvas(!showCanvas); setShowAISidebar(false); playSound(!showCanvas ? 'toggleOn' : 'toggleOff'); }} className={`p-3.5 rounded-2xl transition-all active:scale-90 ${showCanvas ? 'bg-purple-600 text-white shadow-lg' : 'hover:bg-white/5 text-gray-400'}`} title="AI Collaborative Canvas"><Layout size={18} /></button>
                <button onClick={() => { setShowAISidebar(!showAISidebar); setShowCanvas(false); playSound(!showAISidebar ? 'toggleOn' : 'toggleOff'); }} className={`p-3.5 rounded-2xl transition-all active:scale-90 ${showAISidebar ? 'bg-purple-600 text-white shadow-lg' : 'hover:bg-white/5 text-gray-400'}`} title="AI Assistant Sidebar"><Sparkles size={18} /></button>
                <div className="w-px h-6 bg-white/10 mx-1" />
                <button onClick={inviteParticipant} className="p-3.5 rounded-2xl hover:bg-white/5 text-gray-400 transition-all active:scale-90" title="Copy Invite Link"><UserPlus size={18} /></button>
                <button onClick={() => setShowSignOutModal(true)} className="p-3.5 rounded-2xl hover:bg-white/5 text-gray-400 transition-all active:scale-90" title="Sign Out Profile"><LogOut size={18} /></button>
                <button onClick={() => { playSound('exit'); onExit(); }} className="bg-red-500 text-white p-4 rounded-[20px] hover:bg-red-600 shadow-xl shadow-red-500/20 transition-all active:scale-75" title="Leave Meeting"><PhoneOff size={20} /></button>
             </div>
          </div>
        </div>

        {/* Side Intelligence Panel (Fixed Right) */}
        <div className={`fixed top-0 right-0 bottom-0 w-96 bg-[#0a0a0a] border-l border-white/5 transition-transform duration-500 ease-in-out z-[70] ${showAISidebar ? 'translate-x-0 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]' : 'translate-x-full'}`}>
          <div className="h-full flex flex-col">
            <div className="flex p-4 gap-2 border-b border-white/5 bg-white/[0.01]">
              {['chat', 'people', 'memory'].map(tab => (
                <button key={tab} onClick={() => { setActiveTab(tab as any); playSound('click'); }} className={`flex-1 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5'}`}>{tab}</button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
              {activeTab === 'people' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center justify-between"><h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">In Meeting ({participants.length})</h4></div>
                  <div className="space-y-3">
                    {participants.map((p) => (
                      <div key={p.id} className="group flex items-center justify-between p-3.5 glass rounded-2xl border-white/5 hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center text-[10px] font-bold overflow-hidden transition-all duration-300 ${
                            p.isSpeaking ? 'border-purple-500 animate-speaking scale-105 shadow-lg' : 'bg-white/5 border-white/10'
                          }`}>
                            {p.type === 'image' ? <img src={p.source} className="w-full h-full object-cover" /> : p.name.charAt(0)}
                          </div>
                          <div>
                            <p className={`text-[11px] font-bold transition-colors ${p.isSpeaking ? 'text-purple-400' : ''}`}>{p.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {!p.isVideoOn ? <VideoOff size={10} className="text-red-400" /> : <Video size={10} className="text-gray-500" />}
                              {p.isMuted ? <MicOff size={10} className="text-red-400" /> : <Mic size={10} className="text-gray-500" />}
                              {p.isSpeaking && <Volume2 size={10} className="text-purple-400 animate-pulse" />}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => toggleParticipantMute(p.id)} className={`p-2 rounded-lg hover:bg-white/10 ${p.isMuted ? 'text-red-500' : 'text-gray-400'}`} title={p.isMuted ? "Unmute" : "Mute"}><MicOff size={13} /></button>
                          <button onClick={() => toggleParticipantVideo(p.id)} className={`p-2 rounded-lg hover:bg-white/10 ${!p.isVideoOn ? 'text-red-500' : 'text-gray-400'}`} title={p.isVideoOn ? "Stop Video" : "Start Video"}><Video size={13} /></button>
                          {!p.isHost && <button onClick={() => removeParticipant(p.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-500" title="Remove"><UserX size={13} /></button>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Meeting Chat</h4>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className="p-3 glass rounded-2xl border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-purple-400">{msg.user}</span>
                          <span className="text-[9px] text-gray-600">{msg.timestamp.toLocaleTimeString()}</span>
                        </div>
                        <p className="text-[11px]">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'memory' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                   <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                      <input placeholder="Search session archives..." className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-[10px] focus:outline-none focus:border-purple-500/50" />
                   </div>
                   <div className="space-y-3">
                     {['Marketing Strategy Hub', 'Visual Design Sprint', 'Core Security Audit', 'Q4 Product Roadmap'].map((item, i) => (
                       <div key={i} className="p-4 glass rounded-2xl border-white/5 hover:border-purple-500/20 hover:bg-white/5 cursor-pointer transition-all group" onClick={() => playSound('click')}>
                         <p className="text-[11px] font-bold mb-1 group-hover:text-purple-400 transition-colors">{item}</p>
                         <p className="text-[9px] text-gray-600 uppercase font-bold tracking-widest">Session from {i + 2}h ago</p>
                       </div>
                     ))}
                   </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/5 bg-white/[0.01]">
               <div className="relative">
                  <input 
                    placeholder={activeTab === 'chat' ? "Type a message..." : "Ask Aether for help..."} 
                    value={activeTab === 'chat' ? chatInput : ''} 
                    onChange={(e) => activeTab === 'chat' && setChatInput(e.target.value)}
                    onKeyPress={(e) => activeTab === 'chat' && e.key === 'Enter' && sendMessage()}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-5 pr-12 text-[11px] focus:outline-none focus:border-purple-500/50" 
                  />
                  <button 
                    className="absolute right-2 top-1.5 p-2 bg-white text-black rounded-xl hover:scale-105 active:scale-90 transition-all shadow-lg" 
                    onClick={() => activeTab === 'chat' ? sendMessage() : playSound('click')}
                  >
                    <Send size={14} />
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Sign Out Overlay */}
      {showSignOutModal && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="glass p-10 rounded-[40px] border-white/10 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <LogOut className="text-red-500 w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold font-space mb-2">End Session?</h3>
            <p className="text-gray-400 text-sm mb-10">You will be signed out of the Aether neural network. All current canvas states are saved to your vault.</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => { setShowSignOutModal(false); onSignOut?.(); }}
                className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all"
              >
                Sign Out
              </button>
              <button 
                onClick={() => setShowSignOutModal(false)}
                className="w-full py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
              >
                Remain Connected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingRoom;
