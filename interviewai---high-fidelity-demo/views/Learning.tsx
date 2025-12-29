
import React from 'react';
// Fix missing Plus icon import
import { Play, Lock, CheckCircle, Clock, Star, Plus } from 'lucide-react';

const Learning: React.FC = () => {
  const courses = [
    { title: 'The Art of Storytelling in UI/UX', modules: 12, duration: '4h 20m', level: 'Intermediate', progress: 65, status: 'active' },
    { title: 'Nailing Technical Whiteboard Challenges', modules: 8, duration: '2h 15m', level: 'Advanced', progress: 0, status: 'locked' },
    { title: 'Behavioral Interviews for Design Roles', modules: 15, duration: '5h 40m', level: 'Beginner', progress: 100, status: 'completed' },
    { title: 'Mastering the STAR Technique', modules: 6, duration: '1h 30m', level: 'Beginner', progress: 85, status: 'active' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Personalized Path</h2>
          <p className="text-slate-500">Curated based on your last 3 mock interviews</p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl flex items-center gap-2 shadow-sm">
            <Star className="text-amber-500 fill-amber-500" size={16} />
            <span className="text-sm font-bold">Level 12 Explorer</span>
          </div>
          <div className="px-4 py-2 bg-indigo-600 text-white rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-100">
            <span className="text-sm font-bold">1,240 XP</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {courses.map((course, idx) => (
          <div key={idx} className={`bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm transition-all group hover:-translate-y-1 hover:shadow-xl ${course.status === 'locked' ? 'opacity-70 grayscale cursor-not-allowed' : 'cursor-pointer'}`}>
            <div className="relative mb-6">
              <div className="w-full aspect-video bg-slate-100 rounded-3xl overflow-hidden flex items-center justify-center">
                {course.status === 'locked' ? (
                  <Lock size={32} className="text-slate-300" />
                ) : (
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play size={20} className="text-indigo-600 ml-1" />
                  </div>
                )}
              </div>
              {course.progress > 0 && (
                <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-bold text-indigo-600 shadow-sm">
                  {course.progress}% DONE
                </div>
              )}
            </div>

            <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 min-h-[44px]">{course.title}</h3>
            
            <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold mb-6">
              <span className="flex items-center gap-1"><Clock size={12} /> {course.duration}</span>
              <span className="flex items-center gap-1"><Star size={12} /> {course.level}</span>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-1000" style={{width: `${course.progress}%`}}></div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium text-right uppercase tracking-widest">{course.progress === 100 ? 'COMPLETED' : `${course.modules} MODULES`}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
            <Zap size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Drill Practice</h3>
            <p className="text-sm text-slate-500">Quick 5-minute sessions to sharpen specific skills</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Communication Flow', 'Problem Definition', 'Cultural Fit'].map((drill, idx) => (
            <div key={idx} className="p-6 bg-slate-50 rounded-[2rem] border border-transparent hover:border-indigo-200 transition-all group flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 font-bold shadow-sm">
                  0{idx + 1}
                </div>
                <span className="font-bold text-slate-900">{drill}</span>
              </div>
              <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all group-hover:border-indigo-600">
                <ArrowRight size={18} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Import necessary sub-icons
// Fix missing Plus icon
const Zap = ({ size, className }: any) => <Plus size={size} className={className} />;
const ArrowRight = ({ size }: any) => <Plus size={size} className="rotate-[-45deg]" />;

export default Learning;
