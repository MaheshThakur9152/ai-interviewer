
import React, { useState, useRef, useEffect } from 'react';
import { Play, Sparkles, Video, Users, Mic, MessageSquare, Share2, Orbit, ShieldCheck } from 'lucide-react';
import Logo from './Logo';
import BackgroundVideo from './BackgroundVideo';

interface HeroProps {
  onJoin?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onJoin }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [sectionOpacity, setSectionOpacity] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setSectionOpacity(1 - entry.intersectionRatio);
      },
      { threshold: Array.from({ length: 101 }, (_, i) => i / 100) }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - (left + width / 2)) / (width / 2);
    const y = (e.clientY - (top + height / 2)) / (height / 2);
    setTilt({ x: x * 15, y: -y * 15 });
  };

  return (
    <section ref={sectionRef} className="relative pt-40 pb-32 overflow-hidden perspective-2000">
      {/* Background Video */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <BackgroundVideo className="animate-in fade-in duration-1000" />
        {/* Optional cinematic overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 backdrop-blur-[0.5px]" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full" />
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-purple-500/20 bg-purple-500/5 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <Logo size={20} glow={false} />
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.3em]">Quantum Engine v2.5 Online</span>
        </div>
        
        <h1 className="text-6xl md:text-9xl font-bold tracking-tighter mb-8 max-w-6xl mx-auto leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000">
          Spatial <span className="text-gradient">Communication</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
          The world's first AI-native spatial calling platform. Reimagined for depth, intelligence, and persistent collaboration.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-400">
          <button onClick={onJoin} className="group relative w-full sm:w-auto bg-white text-black font-bold px-10 py-5 rounded-full hover:scale-110 transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] active:scale-95 flex items-center justify-center gap-3 overflow-hidden">
            <span className="relative z-10 text-[11px] uppercase tracking-widest">Establish Link</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          </button>
          <button onClick={onJoin} className="w-full sm:w-auto glass-dark text-white font-bold px-10 py-5 rounded-full hover:bg-white/10 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 border-white/5 group">
            <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
            <span className="text-[11px] uppercase tracking-widest">Watch Trailer</span>
          </button>
        </div>

        {/* The 3D Stage Preview */}
        <div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTilt({ x: 0, y: 0 })}
          style={{ transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`, transition: 'transform 0.2s cubic-bezier(0.2, 0, 0.2, 1)' }}
          className="relative max-w-7xl mx-auto group preserve-3d py-10"
        >
          {/* Floating UI Elements (Parallax) */}
          <div className="absolute -top-10 -right-10 glass px-5 py-3 rounded-2xl border-purple-500/20 shadow-2xl z-30 transition-transform duration-500" style={{ transform: `translateZ(100px) translateX(${tilt.x * 2}px) translateY(${tilt.y * 2}px)` }}>
             <div className="flex items-center gap-3 mb-2">
                <ShieldCheck size={14} className="text-purple-400" />
                <span className="text-[9px] font-bold text-purple-400 uppercase">Aether Guard Active</span>
             </div>
             <p className="text-[11px] text-white/80 font-medium">Quantum Encryption: Stabilized</p>
          </div>

          <div className="absolute bottom-20 -left-10 glass px-5 py-4 rounded-2xl border-blue-500/20 shadow-2xl z-30 transition-transform duration-700" style={{ transform: `translateZ(150px) translateX(${-tilt.x * 3}px) translateY(${-tilt.y * 3}px)` }}>
             <div className="flex items-center gap-3 mb-2">
                <Users size={14} className="text-blue-400" />
                <span className="text-[9px] font-bold text-blue-400 uppercase">Live Nodes</span>
             </div>
             <div className="flex -space-x-2">
                {[1,2,3,4].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-[#050505] bg-gray-800" />)}
             </div>
          </div>

          {/* Main Video Plate */}
          <div className="relative glass-dark rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(139,92,246,0.15)] preserve-3d border border-white/10 group-hover:border-purple-500/30 transition-all duration-700">
            <div className="aspect-video bg-black/40 relative">
              <div className="absolute inset-0 p-8 flex flex-col justify-between pointer-events-none z-20">
                <div className="flex justify-between items-start" style={{ transform: 'translateZ(60px)' }}>
                  <div className="glass px-4 py-2 rounded-xl flex items-center gap-3 bg-red-500/10 border-red-500/20">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold tracking-widest uppercase text-red-500">Spatial Sync active</span>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-6 h-full py-16" style={{ transform: 'translateZ(30px)' }}>
                   <div className="col-span-8 rounded-[32px] overflow-hidden bg-[#111] relative border border-white/5 shadow-2xl group/stage">
                      <video autoPlay muted loop playsInline className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000">
                        <source src="https://assets.mixkit.co/videos/preview/mixkit-young-man-sitting-at-a-desk-working-at-a-laptop-41221-large.mp4" type="video/mp4" />
                      </video>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-6 left-6 flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full glass flex items-center justify-center"><Users size={16} /></div>
                         <div className="text-left">
                            <p className="text-[11px] font-bold uppercase tracking-widest">Lead Architect</p>
                            <p className="text-xs text-white/60">Alex Rivera</p>
                         </div>
                      </div>
                   </div>
                   
                   <div className="col-span-4 flex flex-col gap-6" style={{ transform: 'translateZ(80px)' }}>
                      <div className="flex-1 rounded-[32px] overflow-hidden border border-purple-500/30 bg-purple-500/5 p-6 flex flex-col justify-between shadow-inner">
                         <Logo size={40} />
                         <div className="text-left">
                           <p className="text-[9px] font-bold text-purple-400 uppercase tracking-widest mb-2">Neural Insight</p>
                           <p className="text-sm text-white/90 font-medium italic leading-relaxed">"Sarah's proposal aligns 94% with the Q4 scalability goals. Surface documentation?"</p>
                         </div>
                      </div>
                      <div className="flex-1 rounded-[32px] glass border-white/5 p-6 flex items-center justify-center">
                         <div className="text-center">
                            <Orbit className="text-white/20 w-10 h-10 mx-auto mb-2" />
                            <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.3em]">Canvas Standby</p>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Base Reflection Effect */}
          <div className="absolute -bottom-10 inset-x-20 h-2 bg-purple-500/20 blur-[40px] rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
