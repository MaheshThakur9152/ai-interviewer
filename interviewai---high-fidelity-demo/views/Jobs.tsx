
import React, { useState } from 'react';
import { MapPin, DollarSign, ExternalLink, Filter, CheckCircle } from 'lucide-react';

const Jobs: React.FC = () => {
  const [applied, setApplied] = useState<string[]>([]);

  const jobs = [
    { id: '1', company: 'Google', role: 'UX Designer II', match: 96, location: 'Mountain View, CA', salary: '$140k - $190k', tags: ['Figma', 'Prototyping', 'User Research'], logo: 'G' },
    { id: '2', company: 'Figma', role: 'Design Engineer', match: 88, location: 'San Francisco, CA', salary: '$160k - $210k', tags: ['React', 'Design Systems', 'Typescript'], logo: 'F' },
    { id: '3', company: 'Airbnb', role: 'Senior Product Designer', match: 84, location: 'Remote', salary: '$180k - $230k', tags: ['Strategy', 'Mentorship', 'Mobile Design'], logo: 'A' },
    { id: '4', company: 'Notion', role: 'Product Designer', match: 91, location: 'Remote', salary: '$130k - $170k', tags: ['Visual Design', 'Interaction', 'Notion Native'], logo: 'N' },
  ];

  const handleApply = (id: string) => {
    if (!applied.includes(id)) {
      setApplied([...applied, id]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Recommended for You</h2>
          <p className="text-slate-500">Based on your recent interview performance (82% Avg.)</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl flex items-center gap-2 text-sm font-bold shadow-sm hover:bg-slate-50">
            <Filter size={18} />
            Filters
          </button>
          <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors">
            Saved Jobs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col lg:flex-row items-center gap-8">
            <div className="w-20 h-20 rounded-[2rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center text-3xl font-black text-indigo-600 shrink-0">
              {job.logo}
            </div>

            <div className="flex-1 text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-2">
                <h3 className="text-xl font-bold text-slate-900">{job.role}</h3>
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100/50">{job.match}% MATCH</span>
              </div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-6 text-sm text-slate-500 font-medium">
                <span className="font-bold text-slate-700">{job.company}</span>
                <span className="flex items-center gap-1.5"><MapPin size={16} /> {job.location}</span>
                <span className="flex items-center gap-1.5"><DollarSign size={16} /> {job.salary}</span>
              </div>
              <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                {job.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold">{tag}</span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <button 
                onClick={() => handleApply(job.id)}
                disabled={applied.includes(job.id)}
                className={`px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg ${
                  applied.includes(job.id) 
                  ? 'bg-emerald-500 text-white shadow-emerald-100' 
                  : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700 hover:scale-105 active:scale-95'
                }`}
              >
                {applied.includes(job.id) ? (
                  <>
                    <CheckCircle size={20} />
                    Applied
                  </>
                ) : (
                  <>
                    Apply with AI Portfolio
                    <ExternalLink size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Jobs;
