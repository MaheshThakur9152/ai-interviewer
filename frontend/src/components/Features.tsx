
import React, { useState } from 'react';
import { Brain, Clock, Palette, Globe, Search, Scissors, Layers, MessageSquare, Heart, Share2, Sparkles } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, benefits }: any) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    setRotation({ x: x * 15, y: -y * 15 });
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setRotation({ x: 0, y: 0 })}
      style={{
        transform: `perspective(1000px) rotateY(${rotation.x}deg) rotateX(${rotation.y}deg)`,
        transition: 'transform 0.1s ease-out'
      }}
      className="glass p-8 rounded-3xl border-white/5 hover:border-purple-500/20 transition-all group preserve-3d"
    >
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all">
        <Icon className="w-6 h-6 text-purple-400" />
      </div>
      <h3 className="text-2xl font-bold mb-4 font-space" style={{ transform: 'translateZ(20px)' }}>{title}</h3>
      <p className="text-gray-400 mb-6 text-sm leading-relaxed" style={{ transform: 'translateZ(10px)' }}>{description}</p>
      <ul className="space-y-3" style={{ transform: 'translateZ(15px)' }}>
        {benefits.map((benefit: string, idx: number) => (
          <li key={idx} className="flex items-center gap-2 text-xs text-gray-300">
            <div className="w-1 h-1 bg-purple-500 rounded-full group-hover:scale-150 transition-transform"></div>
            {benefit}
          </li>
        ))}
      </ul>
    </div>
  );
};

const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-space tracking-tight">Beyond The Screen</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Traditional calls are for talking. Aether calls are for thinking, building, and remembering.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-32">
          <FeatureCard 
            icon={Brain}
            title="AI in Every Call"
            description="Our native AI joins every session as a silent partner that speaks up when you need it."
            benefits={["Real-time transcription", "Live summarization", "Instant translation", "Fact checking"]}
          />
          <FeatureCard 
            icon={Clock}
            title="Calls That Don't Fade"
            description="Conversation history is no longer just a memory. It's a searchable database."
            benefits={["Searchable transcripts", "Auto-generated clips", "Topic indexing", "Action item tracking"]}
          />
          <FeatureCard 
            icon={Palette}
            title="Infinite Collaboration"
            description="The video feed is just the background. The canvas is where the work happens."
            benefits={["Shared Whiteboards", "Co-editing docs", "AI Image generation", "Code pair-programming"]}
          />
        </div>

        {/* Detailed Feature Rows */}
        <div className="space-y-40">
          {/* Section 1: AI Intelligence */}
          <div className="flex flex-col md:flex-row items-center gap-16 group/row">
            <div className="flex-1 transform-gpu group-hover/row:translate-x-2 transition-transform duration-700">
              <span className="text-purple-400 font-bold uppercase tracking-widest text-[10px] mb-4 block">Section 01 // Intelligence</span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 font-space leading-[1.1]">AI That Actually Participates</h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Aether's AI doesn't just listen. It understands context. Ask it to find a past decision, 
                visualize a concept with AI generation, or translate a speaker in real-time.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start gap-3 hover:translate-y-[-2px] transition-transform">
                  <div className="p-2 glass rounded-lg"><Globe className="w-5 h-5 text-blue-400" /></div>
                  <div>
                    <h4 className="font-bold text-sm">Live Translation</h4>
                    <p className="text-xs text-gray-500">Break language barriers instantly.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 hover:translate-y-[-2px] transition-transform">
                  <div className="p-2 glass rounded-lg"><MessageSquare className="w-5 h-5 text-purple-400" /></div>
                  <div>
                    <h4 className="font-bold text-sm">Live Context</h4>
                    <p className="text-xs text-gray-500">Never lose the thread of conversation.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 glass rounded-3xl p-4 border-purple-500/10 relative group preserve-3d">
               <div className="absolute -top-4 -left-4 glass p-4 rounded-2xl shadow-xl z-20 max-w-[200px] border-blue-500/20 group-hover:-translate-y-2 group-hover:translate-z-20 transition-all">
                  <p className="text-[10px] font-bold text-blue-400 mb-1">AI INSIGHT</p>
                  <p className="text-xs">"Based on Q3 data, this projection seems 12% higher than average."</p>
               </div>
               <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-purple-900/40 to-black overflow-hidden relative">
                  <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-50 mix-blend-overlay group-hover:scale-110 transition-transform duration-[2s]" alt="AI Interface" />
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="w-full h-full border border-white/10 rounded-xl bg-black/40 backdrop-blur-sm p-4 flex flex-col justify-center gap-2 transform group-hover:translate-z-10 transition-transform">
                        <div className="h-2 w-3/4 bg-white/20 rounded animate-[pulse_2s_infinite]"></div>
                        <div className="h-2 w-1/2 bg-white/10 rounded animate-[pulse_3s_infinite]"></div>
                        <div className="h-8 w-full bg-purple-500/20 rounded mt-2 border border-purple-500/30 flex items-center px-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-2 animate-ping"></div>
                           <div className="h-1 flex-1 bg-white/10 rounded-full"></div>
                        </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Section 2: Memory */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-16 group/row">
            <div className="flex-1 transform-gpu group-hover/row:-translate-x-2 transition-transform duration-700">
              <span className="text-blue-400 font-bold uppercase tracking-widest text-[10px] mb-4 block">Section 02 // Memory</span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 font-space leading-[1.1]">Never Take Notes Again</h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Aether automatically extracts the most important moments from your calls. 
                Search through your entire history for that one specific thing someone said three weeks ago.
              </p>
              <div className="space-y-4">
                <div className="glass p-4 rounded-xl flex items-center justify-between hover:bg-white/5 transition-all cursor-pointer group/item">
                  <div className="flex items-center gap-4">
                    <Search className="w-5 h-5 text-gray-400 group-hover/item:text-white transition-colors" />
                    <span className="text-sm font-medium">"Search: When did we talk about the logo?"</span>
                  </div>
                  <Clock className="w-4 h-4 text-gray-600" />
                </div>
                <div className="glass p-4 rounded-xl flex items-center justify-between hover:bg-white/5 transition-all cursor-pointer border-l-4 border-l-purple-500 group/item">
                  <div className="flex items-center gap-4">
                    <Scissors className="w-5 h-5 text-purple-400 group-hover/item:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Auto-Clip: Project Milestone Recap</span>
                  </div>
                  <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded animate-pulse">Saved</span>
                </div>
              </div>
            </div>
            <div className="flex-1 glass rounded-3xl p-6 border-blue-500/10 relative overflow-hidden h-[400px] group">
               <div className="space-y-6 transform group-hover:translate-y-[-10px] transition-transform duration-1000">
                  <div className="flex items-center gap-4 animate-[pulse_3s_infinite]">
                    <div className="w-10 h-10 rounded-full bg-gray-800 border border-white/10 shadow-lg"></div>
                    <div className="h-4 w-48 bg-white/10 rounded-full"></div>
                  </div>
                  <div className="ml-14 p-4 glass rounded-2xl border-purple-500/20 bg-purple-500/5 shadow-2xl shadow-purple-500/5">
                    <p className="text-sm text-gray-300">"The new branding should evoke a sense of flight and freedom."</p>
                    <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] text-purple-400 font-bold flex items-center gap-1">
                           <Sparkles className="w-3 h-3" /> SMART TAG: KEY QUOTE
                        </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 opacity-50">
                    <div className="w-10 h-10 rounded-full bg-gray-800 border border-white/5"></div>
                    <div className="h-4 w-32 bg-white/10 rounded-full"></div>
                  </div>
               </div>
               <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent pointer-events-none"></div>
            </div>
          </div>

          {/* Section 4: Social + Viral */}
          <div className="flex flex-col md:flex-row items-center gap-16 group/row">
            <div className="flex-1 transform-gpu group-hover/row:translate-x-2 transition-transform duration-700">
              <span className="text-pink-400 font-bold uppercase tracking-widest text-[10px] mb-4 block">Section 03 // Social Energy</span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 font-space leading-[1.1]">Share the Best Moments</h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Transform group calls into shared memories. Aether intelligently identifies the funniest, 
                most insightful, or most exciting highlights and prepares them for your social feed.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass p-4 rounded-2xl text-center hover:scale-105 hover:bg-pink-500/5 transition-all cursor-pointer group/btn">
                  <Share2 className="w-6 h-6 mx-auto mb-2 text-pink-400 group-hover/btn:rotate-12 transition-transform" />
                  <p className="text-xs font-bold">Instant Viral Clips</p>
                </div>
                <div className="glass p-4 rounded-2xl text-center hover:scale-105 hover:bg-red-500/5 transition-all cursor-pointer group/btn">
                  <Heart className="w-6 h-6 mx-auto mb-2 text-red-400 group-hover/btn:scale-125 transition-transform" />
                  <p className="text-xs font-bold">Collaborative Likes</p>
                </div>
              </div>
            </div>
            <div className="flex-1 glass rounded-3xl p-8 border-pink-500/10 relative overflow-hidden group">
                <div className="relative z-10 space-y-4">
                    <div className="glass p-4 rounded-2xl border-white/10 flex items-center gap-4 bg-black/40 hover:bg-black/60 transition-colors shadow-2xl">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                            <Sparkles className="text-white w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-pink-400 uppercase tracking-tighter">AI Highlight Ready</p>
                            <p className="text-sm text-white font-medium">"The big reveal" (00:42 - 00:58)</p>
                        </div>
                        <button className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-bold hover:scale-110 active:scale-95 transition-all shadow-lg">Post</button>
                    </div>
                    <div className="aspect-[9/16] w-32 mx-auto glass rounded-2xl border-white/20 overflow-hidden relative shadow-2xl group-hover:rotate-[-2deg] transition-transform duration-500">
                        <img src="https://picsum.photos/seed/highlight/200/400" className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-90 transition-all duration-700" alt="Highlight preview" />
                        <div className="absolute bottom-4 left-0 right-0 px-2">
                             <div className="h-1 bg-white/20 rounded-full w-full overflow-hidden">
                                <div className="h-full bg-pink-500 w-1/2 animate-[loading_2s_infinite]"></div>
                             </div>
                        </div>
                    </div>
                </div>
                {/* 3D Floating Orbs */}
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-pink-500/20 blur-[60px] rounded-full animate-pulse"></div>
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-500/20 blur-[60px] rounded-full animate-[pulse_4s_infinite]"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
