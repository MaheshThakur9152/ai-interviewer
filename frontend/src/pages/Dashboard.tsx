


import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Code2, Server, Database, Brain, ArrowRight, Play, Star, BookOpen, Video } from 'lucide-react';
import { useInterviewStore } from '../store/useInterviewStore';
import { dsaQuestions } from '../data/dsaQuestions';

interface DashboardProps {
    onNavigate: (view: 'interview' | 'landing') => void;
    onSignOut?: () => void;
    user?: any;
}

const topics = [
    { id: 'dsa', name: 'DSA & Algorithms', icon: Code2, desc: 'Arrays, Trees, DP, and Graphs', color: 'from-blue-500 to-cyan-500' },
    { id: 'system', name: 'System Design', icon: Server, desc: 'Scalability, Load Balancing', color: 'from-purple-500 to-pink-500' },
    { id: 'db', name: 'Database Design', icon: Database, desc: 'SQL, NoSQL, Normalization', color: 'from-orange-500 to-red-500' },
    { id: 'behavioral', name: 'Behavioral', icon: Brain, desc: 'Leadership, Conflict Resolution', color: 'from-green-500 to-emerald-500' },
];

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onSignOut, user }) => {
    const { startSession, setCode } = useInterviewStore();
    const [selectedCategory, setSelectedCategory] = useState<string>('dsa');

    const handleStartQuestion = (q: any) => {
        // You might want to pass the question text/details to the store
        // For now, let's just start the session with the question title
        startSession(`DSA - ${q.title}`);
        // Optionally pre-fill the editor or context with the question
        // setCode(\`// \${q.title}\n// \${q.description}\n\ndef solution():\n  pass\`); 
        onNavigate('interview');
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30">
            <Navbar onJoin={() => { }} onSignOut={onSignOut} user={user} />

            <main className="container mx-auto px-6 pt-28 pb-20">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 animate-in slide-in-from-bottom-5 duration-700">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-bold font-space tracking-tight mb-4">
                            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">{user?.name?.split(' ')[0] || 'Engineer'}</span>
                        </h1>
                        <p className="text-gray-400 max-w-2xl text-lg font-light">
                            Ready to master your technical interview skills? Select a module below to begin.
                        </p>
                    </div>
                </div>

                {/* Topic Tabs */}
                <div className="flex gap-4 mb-10 overflow-x-auto pb-4 scrollbar-hide">
                    {topics.map(topic => (
                        <button
                            key={topic.id}
                            onClick={() => setSelectedCategory(topic.id)}
                            className={`flex items-center gap-3 px-6 py-3 rounded-full border transition-all duration-300 whitespace-nowrap ${selectedCategory === topic.id
                                ? `bg-white/10 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)]`
                                : 'bg-transparent border-transparent hover:bg-white/5 text-gray-500 hover:text-white'
                                }`}
                        >
                            <topic.icon size={18} className={selectedCategory === topic.id ? 'text-white' : ''} />
                            <span className="font-bold text-sm tracking-wide">{topic.name}</span>
                        </button>
                    ))}
                </div>

                {/* Content Grid */}
                {selectedCategory === 'dsa' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {dsaQuestions.map((q, idx) => (
                            <div key={q.id} className="group glass p-6 rounded-3xl border-white/5 relative hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1">
                                <div className={`absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${q.difficulty === 'Easy' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                                    q.difficulty === 'Medium' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' :
                                        'border-red-500/30 text-red-400 bg-red-500/10'
                                    }`}>
                                    {q.difficulty}
                                </div>

                                <div className="mb-4 mt-2">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-white border border-white/10">
                                        <Code2 size={18} />
                                    </div>
                                    <h3 className="text-lg font-bold font-space leading-tight mb-2 group-hover:text-purple-300 transition-colors">{q.title}</h3>
                                    <p className="text-xs text-gray-500 line-clamp-2">{q.description}</p>
                                </div>

                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                                    <span className="text-[10px] font-mono text-gray-600">ID: #{String(q.id).padStart(3, '0')}</span>
                                    <button
                                        onClick={() => handleStartQuestion(q)}
                                        className="flex items-center gap-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-full transition-all shadow-lg shadow-purple-900/20 hover:shadow-purple-700/40 active:scale-95"
                                    >
                                        <Play size={10} fill="currentColor" />
                                        Start
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center glass rounded-[40px] border-white/5">
                        <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-6">
                            <BookOpen size={32} className="text-gray-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-300 mb-2">Coming Soon</h3>
                        <p className="text-gray-500">This module is currently under development.</p>
                        <button onClick={() => setSelectedCategory('dsa')} className="mt-6 text-purple-400 hover:text-purple-300 text-sm font-bold flex items-center gap-2">
                            Return to DSA <ArrowRight size={14} />
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
