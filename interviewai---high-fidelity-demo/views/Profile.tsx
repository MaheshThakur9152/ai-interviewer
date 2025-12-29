
import React from 'react';
import { 
  History, 
  BarChart, 
  Settings, 
  Link as LinkIcon, 
  MoreVertical,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

const historyData = [
  { date: 'Jan 10', score: 62 },
  { date: 'Jan 15', score: 68 },
  { date: 'Jan 18', score: 72 },
  { date: 'Jan 22', score: 82 },
  { date: 'Jan 24', score: 78 },
];

const Profile: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Stats */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm overflow-hidden relative">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10">
              <img src="https://picsum.photos/seed/alex/200/200" alt="Profile" className="w-32 h-32 rounded-[2.5rem] object-cover border-4 border-slate-50 shadow-xl" />
              <div>
                <h2 className="text-3xl font-black text-slate-900 mb-1">Alex Rivera</h2>
                <p className="text-slate-500 font-medium mb-4">Aspiring UI/UX Designer • Level 12 Professional</p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold border border-indigo-100">Top 5% Figma</span>
                  <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100">Fluent Speaker</span>
                  <span className="px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-xs font-bold border border-amber-100">Design Systems</span>
                </div>
              </div>
              <div className="md:ml-auto">
                <button className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                  <Settings size={20} />
                </button>
              </div>
            </div>
            <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-50 rounded-full blur-[100px] opacity-30 -mr-32 -mt-32"></div>
          </div>

          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="text-indigo-600" />
                Performance Velocity
              </h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold">Score</button>
                <button className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-xs font-bold">Confidence</button>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    cursor={{stroke: '#6366f1', strokeWidth: 2}}
                  />
                  <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={4} dot={{fill: '#6366f1', r: 6, strokeWidth: 4, stroke: '#fff'}} activeDot={{r: 8}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline & Badges */}
        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[3rem] p-8 text-white">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold">Latest Badges</h3>
              <button className="text-xs font-bold text-slate-400 hover:text-white">View All</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Fast Talker', icon: Zap, color: 'bg-amber-500' },
                { label: 'Star Method', icon: Award, color: 'bg-indigo-500' },
                { label: 'Research Pro', icon: TrendingUp, color: 'bg-emerald-500' },
                { label: 'Deep Thinker', icon: BarChart, color: 'bg-purple-500' }
              ].map((badge, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-[2rem] p-4 text-center group cursor-pointer hover:bg-white/10 transition-all">
                  <div className={`w-12 h-12 ${badge.color} rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                    <badge.icon size={20} className="text-white" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{badge.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm flex-1">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <History className="text-indigo-600" size={20} />
              Recent History
            </h3>
            <div className="space-y-6">
              {[
                { title: 'UI/UX Designer Mock', company: 'Self Practice', score: 82, date: 'Today' },
                { title: 'Junior Designer Interview', company: 'Google Mock', score: 75, date: '2 days ago' },
                { title: 'Product Design Fundamentals', company: 'Drill Session', score: 94, date: '1 week ago' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <ChevronRight size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{item.title}</p>
                      <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{item.date} • {item.company}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">{item.score}%</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 rounded-2xl border border-slate-100 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all">
              Load Full History
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

// Internal icon mappings
const Plus = ({ size, className }: any) => <BarChart size={size} className={className} />;
const Zap = ({ size, className }: any) => <Award size={size} className={className} />;

export default Profile;
