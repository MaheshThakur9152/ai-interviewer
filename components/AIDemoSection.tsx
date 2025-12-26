
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Zap, Image as ImageIcon, Layout, Type, Cpu, Orbit } from 'lucide-react';

const AIDemoSection: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'I am your Aether assistant. Ready to generate ideas, images, or summaries during our call.' }
  ]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - (left + width / 2)) / (width / 2);
    const y = (e.clientY - (top + height / 2)) / (height / 2);
    setTilt({ x: x * 8, y: -y * 8 });
  };

  const handleSend = async () => {
    if (!prompt) return;
    setLoading(true);
    const userMsg = prompt;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setPrompt('');

    try {
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="demo" className="py-24 bg-[#0a0a0a] perspective-2000 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 font-space tracking-tight">Experience the Intelligence</h2>
            <p className="text-gray-400">Interact with the Aether core. Imagine this happening in the middle of your video call.</p>
          </div>

          <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            style={{ 
              transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
              transition: 'transform 0.4s cubic-bezier(0.2, 0, 0.2, 1)'
            }}
            className="glass rounded-[40px] overflow-hidden border-purple-500/20 shadow-2xl shadow-purple-500/5 preserve-3d"
          >
            {/* Neural Hub Header */}
            <div className="bg-white/5 border-b border-white/10 p-5 flex items-center justify-between backdrop-blur-3xl" style={{ transform: 'translateZ(20px)' }}>
              <div className="flex items-center gap-4">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 bg-red-500/50 rounded-full" />
                  <div className="w-2.5 h-2.5 bg-yellow-500/50 rounded-full" />
                  <div className="w-2.5 h-2.5 bg-green-500/50 rounded-full" />
                </div>
                <div className="h-4 w-px bg-white/10 mx-2" />
                <div className="flex items-center gap-2">
                  <Cpu size={14} className="text-purple-400" />
                  <span className="text-[10px] font-mono font-bold text-gray-400 tracking-widest uppercase">AETHER_CORE_V2.5 // NEURAL_LINK</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                  <Zap className="w-3 h-3 text-purple-400" />
                  <span className="text-[9px] text-purple-400 font-bold tracking-tighter uppercase">Ultra Low Latency</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row h-[600px] preserve-3d">
              {/* Left: Holographic AI Core visualization */}
              <div className="flex-1 bg-black/40 p-8 flex flex-col items-center justify-center relative overflow-hidden group/core preserve-3d border-r border-white/5">
                {/* Background Grid for depth */}
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: 'linear-gradient(rgba(139,92,246,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                
                {/* The "Brain" Orb */}
                <div className="relative preserve-3d" style={{ transform: 'translateZ(100px)' }}>
                  <div className="w-48 h-48 rounded-full bg-purple-600/10 border border-purple-500/30 flex items-center justify-center relative shadow-[0_0_80px_rgba(139,92,246,0.2)] animate-pulse">
                    <Orbit size={64} className="text-purple-400 animate-spin-slow opacity-40" />
                    <Sparkles size={32} className="text-white absolute animate-pulse" />
                    
                    {/* Floating Data Nodes */}
                    {[...Array(6)].map((_, i) => (
                      <div 
                        key={i}
                        className="absolute w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_10px_rgba(167,139,250,0.8)]"
                        style={{
                          top: `${50 + 40 * Math.sin(i * (Math.PI / 3))}%`,
                          left: `${50 + 40 * Math.cos(i * (Math.PI / 3))}%`,
                          transform: `translateZ(${20 + i * 10}px)`,
                          animation: `bounce 3s infinite ${i * 0.5}s`
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Outer Orbit Ring */}
                  <div className="absolute inset-[-40px] border border-white/5 rounded-full rotate-45 animate-spin-slow" />
                  <div className="absolute inset-[-20px] border border-purple-500/10 rounded-full -rotate-12 animate-[spin_10s_linear_infinite]" />
                </div>

                <div className="mt-12 text-center" style={{ transform: 'translateZ(50px)' }}>
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.4em] mb-2">Cognitive Presence</p>
                  <p className="text-xs text-white/40 max-w-[240px] mx-auto leading-relaxed">The AI core monitors dialogue sentiment and technical context in real-time.</p>
                </div>

                {/* Corner Accents */}
                <div className="absolute bottom-6 right-6 flex items-center gap-4" style={{ transform: 'translateZ(30px)' }}>
                  <div className="text-right">
                    <span className="text-[8px] font-bold text-gray-600 block uppercase tracking-widest">Processing Load</span>
                    <div className="h-1 w-20 bg-white/5 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-purple-500 w-2/3 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Side */}
              <div className="flex-1 flex flex-col preserve-3d" style={{ transform: 'translateZ(10px)' }}>
                <div className="flex-1 p-8 space-y-6 overflow-y-auto bg-black/20 backdrop-blur-xl">
                  {messages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}
                      style={{ transform: `translateZ(${idx * 5}px)` }}
                    >
                      <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-[13px] leading-relaxed shadow-xl ${
                        msg.role === 'user' 
                        ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white border border-white/10' 
                        : 'glass-dark border-white/5 text-gray-300'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="glass border-white/10 px-4 py-3 rounded-2xl flex items-center gap-3">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        </div>
                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Thinking</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input Field */}
                <div className="p-6 bg-white/[0.02] border-t border-white/10" style={{ transform: 'translateZ(30px)' }}>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-purple-500/5 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <input 
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask the AI core anything..."
                      className="relative w-full bg-white/[0.03] border border-white/10 rounded-[20px] px-6 py-4 text-sm focus:outline-none focus:border-purple-500/50 transition-all pr-14 placeholder:text-gray-600 font-medium"
                    />
                    <button 
                      onClick={handleSend}
                      disabled={!prompt}
                      className="absolute right-2.5 top-2 p-2.5 rounded-xl bg-white text-black hover:scale-110 active:scale-95 transition-all shadow-lg disabled:opacity-20 disabled:grayscale"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-6 opacity-30">
                    <div className="flex items-center gap-2">
                       <ImageIcon size={12} />
                       <span className="text-[9px] font-bold uppercase tracking-widest">Image Gen</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Layout size={12} />
                       <span className="text-[9px] font-bold uppercase tracking-widest">UI Forge</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Type size={12} />
                       <span className="text-[9px] font-bold uppercase tracking-widest">Summarize</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Reflection */}
          <div className="mt-12 w-1/2 mx-auto h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent blur-sm" />
        </div>
      </div>
    </section>
  );
};

export default AIDemoSection;
