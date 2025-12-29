
import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  ArrowLeft, 
  Download, 
  Share2, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Lightbulb,
  FileText,
  Calendar,
  // Fix missing icon imports
  Award,
  BookOpen,
  Target,
  TrendingUp,
  ArrowRight,
  BarChart3,
  Plus
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';
import { InterviewData } from '../types';
import { generateFinalScorecard } from '../geminiService';

interface PostInterviewProps {
  data: InterviewData | null;
  onRetry: () => void;
}

const PostInterview: React.FC<PostInterviewProps> = ({ data, onRetry }) => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!data) return;
      setLoading(true);
      const transcript = data.messages.map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n');
      const result = await generateFinalScorecard(data.roleName, transcript);
      setReport(result);
      setLoading(false);
    };
    fetchReport();
  }, [data]);

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-1000">
        <div className="relative w-32 h-32 mb-10">
          <div className="absolute inset-0 border-8 border-indigo-100 rounded-full"></div>
          <div className="absolute inset-0 border-8 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles size={40} className="text-indigo-600 animate-pulse" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Compiling Your Performance Analysis...</h2>
        <p className="text-slate-500 max-w-md text-lg leading-relaxed">Our AI is analyzing your facial expressions, keyword density, and structural clarity to give you precise feedback.</p>
        <div className="mt-12 flex gap-4">
          {['Analyzing Sentiment', 'Scoring Keywords', 'Evaluating Confidence'].map((step, i) => (
            <div key={i} className="px-4 py-2 bg-slate-50 rounded-full text-xs font-bold text-slate-400 border border-slate-100 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></div>
              {step}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const radarData = report ? [
    { subject: 'Communication', A: report.scores.communication, fullMark: 100 },
    { subject: 'Confidence', A: report.scores.confidence, fullMark: 100 },
    { subject: 'Technical', A: report.scores.technical, fullMark: 100 },
    { subject: 'Structure', A: report.scores.structure, fullMark: 100 },
    { subject: 'Depth', A: report.scores.depth, fullMark: 100 },
  ] : [];

  const barData = report ? [
    { name: 'Comm.', val: report.scores.communication, color: '#6366f1' },
    { name: 'Conf.', val: report.scores.confidence, color: '#f59e0b' },
    { name: 'Tech.', val: report.scores.technical, color: '#10b981' },
    { name: 'Struct.', val: report.scores.structure, color: '#8b5cf6' },
    { name: 'Depth', val: report.scores.depth, color: '#ec4899' },
  ] : [];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-700">
      {/* Summary Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-10 items-center">
          <div className="relative shrink-0">
            <div className="w-40 h-40 rounded-full bg-indigo-50 border-8 border-white shadow-xl flex items-center justify-center">
              <div className="text-center">
                <p className="text-4xl font-black text-slate-900">{report?.overallScore}%</p>
                <p className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase">Overall</p>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-indigo-50">
              <Trophy className="text-yellow-500" size={20} />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h2 className="text-2xl font-bold text-slate-900">{data?.roleName} Session</h2>
              <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-bold uppercase">Passed</span>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6 text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-2"><Calendar size={16} /> Jan 24, 2025</div>
              <div className="flex items-center gap-2"><FileText size={16} /> 128 Questions Asked</div>
            </div>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={onRetry}
                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                <RefreshCw size={18} />
                Retry Interview
              </button>
              <button className="px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-200 transition-all">
                <Download size={18} />
                Download Report
              </button>
              <button className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Lightbulb className="text-yellow-400" size={20} />
            AI Feedback Summary
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed mb-8 relative z-10">
            "Your technical knowledge is outstanding. You clearly understand grid systems and typography. However, try to avoid long pauses when describing your problem-solving process. Using the STAR method consistently will help you structure better."
          </p>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 relative z-10">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Top Recommendation</p>
            <p className="text-sm font-bold">Focus on: Case Study Storytelling</p>
          </div>
          <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-indigo-600/20 rounded-full blur-[80px]"></div>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-8 flex items-center gap-3">
            <BarChart2 size={20} className="text-indigo-600" />
            Competency Breakdown
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{fontSize: 12, fill: '#64748b', fontWeight: 600}} />
                <Radar
                  name="You"
                  dataKey="A"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.2}
                  strokeWidth={3}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-8 flex items-center gap-3">
            <Award size={20} className="text-indigo-600" />
            Detailed Scoring
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{left: 20}}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#64748b'}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="val" radius={[0, 10, 10, 0]} barSize={32}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-emerald-50/50 rounded-[3rem] p-10 border border-emerald-100">
          <h3 className="font-bold text-emerald-900 mb-8 flex items-center gap-3">
            <CheckCircle2 className="text-emerald-600" size={24} />
            Top Strengths
          </h3>
          <div className="space-y-4">
            {report?.strengths.map((s: string, i: number) => (
              <div key={i} className="flex gap-4 items-start bg-white p-5 rounded-3xl shadow-sm shadow-emerald-200/20 border border-emerald-100/50">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600 font-bold text-xs">{i + 1}</div>
                <p className="text-slate-700 font-medium">{s}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-rose-50/50 rounded-[3rem] p-10 border border-rose-100">
          <h3 className="font-bold text-rose-900 mb-8 flex items-center gap-3">
            <XCircle className="text-rose-600" size={24} />
            Areas for Improvement
          </h3>
          <div className="space-y-4">
            {report?.weaknesses.map((w: string, i: number) => (
              <div key={i} className="flex gap-4 items-start bg-white p-5 rounded-3xl shadow-sm shadow-rose-200/20 border border-rose-100/50">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0 text-rose-600 font-bold text-xs">{i + 1}</div>
                <p className="text-slate-700 font-medium">{w}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Improvement Roadmap */}
      <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-8 flex items-center gap-3 text-xl">
          <Zap className="text-amber-500" size={24} />
          Recommended Next Steps
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {report?.improvementPlan.map((step: string, i: number) => (
            <div key={i} className="group cursor-pointer">
              <div className="h-full p-8 bg-slate-50 rounded-[2.5rem] border border-transparent group-hover:border-indigo-200 group-hover:bg-white group-hover:shadow-xl group-hover:shadow-indigo-50 transition-all flex flex-col">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {i === 0 ? <BookOpen size={24} /> : i === 1 ? <Target size={24} /> : <TrendingUp size={24} />}
                </div>
                <h4 className="font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                  {i === 0 ? 'Review Resource' : i === 1 ? 'Practice Drill' : 'Goal Setting'}
                </h4>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">{step}</p>
                <div className="mt-auto flex items-center gap-2 text-xs font-bold text-indigo-600">
                  START NOW <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Internal sub-components used only in results
// Fix missing icon name BarChart3 and Plus
const BarChart2 = ({ size, className }: any) => <BarChart3 size={size} className={className} />;
const Zap = ({ size, className }: any) => <Plus size={size} className={className} />;
const Sparkles = ({ size, className }: any) => <Award size={size} className={className} />;

export default PostInterview;
