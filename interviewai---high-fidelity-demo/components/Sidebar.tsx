
import React from 'react';
import { 
  LayoutDashboard, 
  Video, 
  BookOpen, 
  Briefcase, 
  UserCircle, 
  LogOut,
  Zap,
  BarChart3
} from 'lucide-react';
import { Screen } from '../types';

interface SidebarProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeScreen, onNavigate }) => {
  const menuItems = [
    { id: Screen.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: Screen.INTERVIEW_ROOM, label: 'Interview Room', icon: Video },
    { id: Screen.LEARNING, label: 'Learning Path', icon: BookOpen },
    { id: Screen.JOBS, label: 'Job Board', icon: Briefcase },
    { id: Screen.PROFILE, label: 'Profile & Analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-slate-900 h-full flex flex-col shrink-0 text-slate-400">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <Zap className="fill-current" size={24} />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">InterviewAI</span>
      </div>

      <nav className="flex-1 px-4 mt-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
              activeScreen === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} className={activeScreen === item.id ? 'text-white' : 'group-hover:text-white transition-colors'} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-slate-800/50 rounded-2xl p-5 mb-4 border border-slate-700/50">
          <p className="text-xs text-slate-500 mb-1">PRO PLAN</p>
          <p className="text-sm font-semibold text-white mb-3">Unlimited Mock Interviews</p>
          <div className="w-full bg-slate-700 rounded-full h-1.5 mb-1">
            <div className="bg-indigo-500 h-1.5 rounded-full w-[85%]"></div>
          </div>
          <p className="text-[10px] text-slate-500 text-right">24/30 Days Remaining</p>
        </div>

        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all text-slate-500">
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
