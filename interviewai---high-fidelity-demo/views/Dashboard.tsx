
import React from 'react';
import { 
  TrendingUp, 
  Target, 
  Award, 
  ArrowRight,
  Plus,
  Briefcase
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const data = [
  { name: 'Mon', score: 65 },
  { name: 'Tue', score: 68 },
  { name: 'Wed', score: 75 },
  { name: 'Thu', score: 72 },
  { name: 'Fri', score: 80 },
  { name: 'Sat', score: 85 },
  { name: 'Sun', score: 82 },
];

const readinessData = [
  { name: 'Achieved', value: 78 },
  { name: 'Remaining', value: 22 },
];

const COLORS = ['#6366f1', '#f1f5f9'];

interface DashboardProps {
  onStartInterview: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onStartInterview }) => {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Top Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-indigo-600 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-2xl shadow-indigo-200">
          <div className="relative z-10 h-full flex flex-col">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">Master your next <br/>dream job interview.</h2>
            <p className="text-indigo-100 text-lg mb-8 max-w-md">Our AI analyzes 50+ verbal and non-verbal cues to give you professional-grade feedback.</p>
            <div className="mt-auto flex flex-wrap gap-4">
              <button 
                onClick={onStartInterview}
                className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-50 transition-all shadow-lg hover:scale-105 active:scale-95"
              >
                <Plus size={20} />
                Start New Interview
              </button>
              <button className="bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold border border-indigo-400/30 hover:bg-indigo-400/20 transition-all">
                Practice Weak Skills
              </button>
            </div>
          </div>
          {/* Abstract blobs for decor */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500 rounded-full blur-[100px] opacity-40"></div>
          <div className="absolute -bottom-20 right-40 w-60 h-60 bg-indigo-400 rounded-full blur-[80px] opacity-30"></div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
          <h3 className="text-slate-900 font-bold mb-6">Job Readiness Score</h3>
          <div className="relative w-48 h-48 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={readinessData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                >
                  {readinessData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-slate-900">78%</span>
              <span className="text-sm text-slate-500 font-medium">Excellent</span>
            </div>
          </div>
          <div className="w-full space-y-3">
            <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500">Skill Percentile</span>
              <span className="font-bold text-slate-900">Top 12%</span>
            </div>
            <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500">Industry Avg.</span>
              <span className="font-bold text-slate-900">62%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats & Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Score Progress</h3>
              <p className="text-sm text-slate-500">Average score over the last 7 days</p>
            </div>
            <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500">
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  cursor={{stroke: '#6366f1', strokeWidth: 2}}
                />
                <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Quick Insights</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0">
                  <TrendingUp className="text-orange-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Weakest Area</p>
                  <p className="text-sm font-bold text-slate-900">Technical Depth</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center shrink-0">
                  <Target className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Strongest Area</p>
                  <p className="text-sm font-bold text-slate-900">Body Language</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center shrink-0">
                  <Award className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Badge Earned</p>
                  <p className="text-sm font-bold text-slate-900">Fluent Communicator</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Job Matches</h3>
              <button className="text-xs text-indigo-600 font-bold hover:underline">View All</button>
            </div>
            <div className="space-y-3">
              {[
                { company: 'Google', role: 'UI Designer', match: '94%' },
                { company: 'Airbnb', role: 'Product Designer', match: '88%' },
                { company: 'Stripe', role: 'Design Engineer', match: '82%' }
              ].map((job, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-[10px] font-bold">
                      {job.company[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{job.role}</p>
                      <p className="text-[10px] text-slate-500">{job.company}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-indigo-600">{job.match}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
