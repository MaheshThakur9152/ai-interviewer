


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

    // Mock progress data
    const progress = {
        total: 120,
        completed: 45,
        mastered: 28,
        streak: 7
    };

    const handleStartQuestion = (q: any) => {
        startSession(`DSA - ${q.title}`);
        onNavigate('interview');
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 font-sans overflow-hidden relative">
            <Navbar onJoin={() => { }} onSignOut={onSignOut} user={user} />

            {/* Dynamic Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s' }} />
                <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[80px]" />
            </div>

            <main className="container mx-auto px-6 pt-32 pb-20 relative z-10 max-w-7xl">

                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">

                    {/* Main Welcome Card */}
                    <div className="lg:col-span-8 glass rounded-[40px] p-10 md:p-14 relative overflow-hidden border border-white/5 group shadow-2xl shadow-black/50">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />

                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] transform translate-x-10 -translate-y-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700">
                            <Code2 size={400} />
                        </div>

                        <div className="relative z-10 flex flex-col h-full justify-center">
                            <div className="inline-flex max-w-fit items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold uppercase tracking-widest text-purple-200 mb-8 backdrop-blur-md">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Ready for Interview
                            </div>

                            <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight mb-6 leading-[1.1]">
                                Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-indigo-300 to-blue-300">
                                    {user?.name?.split(' ')[0] || 'Engineer'}
                                </span>
                            </h1>

                            <p className="text-gray-400 text-xl max-w-xl mb-10 leading-relaxed font-light">
                                Your journey to mastery continues. You've solved <span className="text-white font-bold">{progress.completed}</span> problems this week. Keep the momentum going!
                            </p>

                            <div className="flex flex-wrap gap-5">
                                <button
                                    onClick={() => handleStartQuestion(dsaQuestions[0])}
                                    className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all active:scale-95 flex items-center gap-3 text-sm tracking-wide"
                                >
                                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
                                        <Play size={14} fill="currentColor" />
                                    </div>
                                    Resume Practice
                                </button>
                                <div className="px-8 py-4 glass rounded-2xl text-gray-300 font-medium flex items-center gap-3 border border-white/10 hover:bg-white/5 transition-colors cursor-default">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-yellow-500 blur-lg opacity-20" />
                                        <Star size={20} className="text-yellow-400 relative z-10" fill="currentColor" />
                                    </div>
                                    <span className="text-sm tracking-wide"><span className="text-white font-bold text-lg">{progress.streak}</span> Day Streak</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column Stats */}
                    <div className="lg:col-span-4 flex flex-col gap-6">

                        {/* Progress Card */}
                        <div className="flex-1 glass rounded-[40px] p-8 border border-white/5 relative overflow-hidden group hover:border-blue-500/20 transition-colors">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] -mr-16 -mt-16" />

                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Weekly Goal</p>
                                    <h3 className="text-4xl font-bold text-white font-display">85%</h3>
                                </div>
                                <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400">
                                    <Database size={24} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
                                        <span>Progress</span>
                                        <span>{progress.completed}/{progress.total}</span>
                                    </div>
                                    <div className="w-full bg-gray-800/50 h-3 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                                        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 w-[70%] shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
                                    </div>
                                </div>
                                <p className="text-xs text-center text-gray-500">You're slightly ahead of schedule!</p>
                            </div>
                        </div>

                        {/* Mastery Card */}
                        <div className="flex-1 glass rounded-[40px] p-8 border border-white/5 relative overflow-hidden group hover:border-purple-500/20 transition-colors">
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] -ml-16 -mb-16" />

                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Skill Level</p>
                                    <h3 className="text-3xl font-bold text-white font-display">Senior</h3>
                                </div>
                                <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-400">
                                    <Brain size={24} />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {['Dynamic Programming', 'System Design', 'Graphs'].map(tag => (
                                    <span key={tag} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-gray-400 border border-white/5 transition-colors cursor-default tracking-wide">{tag}</span>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Modules Navigation */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
                    <h2 className="text-3xl font-bold flex items-center gap-4 font-display">
                        <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_10px_white]" />
                        Modules
                    </h2>

                    <div className="p-1.5 glass rounded-2xl border border-white/5 flex gap-1 overflow-x-auto max-w-full">
                        {topics.map(topic => (
                            <button
                                key={topic.id}
                                onClick={() => setSelectedCategory(topic.id)}
                                className={`px-6 py-3 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${selectedCategory === topic.id
                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <topic.icon size={14} />
                                {topic.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Question Grid */}
                {selectedCategory === 'dsa' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {dsaQuestions.map((q, idx) => (
                            <div key={q.id}
                                className="group glass p-1 rounded-[32px] border border-white/5 hover:border-purple-500/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-900/20"
                            >
                                <div className="bg-[#0a0a0a]/40 rounded-[28px] p-6 h-full flex flex-col relative overflow-hidden">
                                    {/* Card Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#050505] flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                                            <Code2 size={24} className="text-gray-400 group-hover:text-purple-400 transition-colors" />
                                        </div>
                                        <div className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border backdrop-blur-md ${q.difficulty === 'Easy' ? 'border-green-500/20 text-green-400 bg-green-500/5' :
                                            q.difficulty === 'Medium' ? 'border-yellow-500/20 text-yellow-400 bg-yellow-500/5' :
                                                'border-red-500/20 text-red-400 bg-red-500/5'
                                            }`}>
                                            {q.difficulty}
                                        </div>
                                    </div>

                                    <div className="mb-6 relative z-10 flex-1">
                                        <h3 className="text-xl font-bold font-display leading-tight mb-3 group-hover:text-purple-200 transition-colors">{q.title}</h3>
                                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{q.description}</p>
                                    </div>

                                    <div className="relative z-10 pt-4 border-t border-white/5 flex items-center justify-between">
                                        <span className="text-[10px] font-mono text-gray-600 flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-700" />
                                            #{String(q.id).padStart(3, '0')}
                                        </span>
                                        <button
                                            onClick={() => handleStartQuestion(q)}
                                            className="h-10 w-10 bg-white text-black rounded-full flex items-center justify-center hover:bg-purple-400 hover:text-white transition-all shadow-lg hover:rotate-90 duration-500 active:scale-95"
                                        >
                                            <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="w-full flex flex-col items-center justify-center py-40 glass rounded-[48px] border border-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-28 h-28 bg-[#0a0a0a] rounded-full flex items-center justify-center mb-8 border border-white/5 shadow-2xl animate-pulse ring-1 ring-white/10">
                                <BookOpen size={48} className="text-gray-700" />
                            </div>
                            <h3 className="text-4xl font-bold text-gray-200 mb-4 font-display">Module Locked</h3>
                            <p className="text-gray-500 max-w-md text-center text-lg font-light leading-relaxed mb-10">
                                The <span className="text-purple-400 font-bold">{topics.find(t => t.id === selectedCategory)?.name}</span> module is crafting its questions.
                            </p>
                            <button onClick={() => setSelectedCategory('dsa')} className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-sm font-bold transition-all text-gray-300 hover:text-white uppercase tracking-widest backdrop-blur-md">
                                Return to DSA
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
