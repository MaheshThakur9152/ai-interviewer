
import React from 'react';
import { Bell, Search, Settings } from 'lucide-react';
import { User, Screen } from '../types';

interface HeaderProps {
  user: User;
  currentScreen: Screen;
}

const Header: React.FC<HeaderProps> = ({ user, currentScreen }) => {
  const getTitle = () => {
    switch (currentScreen) {
      case Screen.DASHBOARD: return 'Dashboard';
      case Screen.INTERVIEW_ROOM: return 'Interview Simulation';
      case Screen.POST_INTERVIEW: return 'Interview Scorecard';
      case Screen.LEARNING: return 'Learning & Practice';
      case Screen.JOBS: return 'Job Discovery';
      case Screen.PROFILE: return 'Career Analytics';
      default: return 'InterviewAI';
    }
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{getTitle()}</h1>
        <p className="text-sm text-slate-500 font-medium">Welcome back, {user.name.split(' ')[0]}!</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search resources, jobs..." 
            className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full w-64 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 border-r border-slate-200 pr-6">
          <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
            <Settings size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{user.name}</p>
            <p className="text-xs text-slate-500">{user.role}</p>
          </div>
          <img src={user.avatar} alt="User Avatar" className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-50/50 group-hover:ring-indigo-500/30 transition-all" />
        </div>
      </div>
    </header>
  );
};

export default Header;
