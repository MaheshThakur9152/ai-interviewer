
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './views/Dashboard';
import InterviewRoom from './views/InterviewRoom';
import PostInterview from './views/PostInterview';
import Learning from './views/Learning';
import Jobs from './views/Jobs';
import Profile from './views/Profile';
import { Screen, User, InterviewData } from './types';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.DASHBOARD);
  const [user] = useState<User>({
    name: 'Alex Rivera',
    role: 'Aspiring UI/UX Designer',
    avatar: 'https://picsum.photos/seed/alex/200/200',
    readinessScore: 78
  });

  const [lastInterview, setLastInterview] = useState<InterviewData | null>(null);

  const navigateTo = (screen: Screen) => setCurrentScreen(screen);

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.DASHBOARD:
        return <Dashboard onStartInterview={() => navigateTo(Screen.INTERVIEW_ROOM)} />;
      case Screen.INTERVIEW_ROOM:
        return <InterviewRoom 
                  onComplete={(data) => {
                    setLastInterview(data);
                    navigateTo(Screen.POST_INTERVIEW);
                  }} 
                />;
      case Screen.POST_INTERVIEW:
        return <PostInterview data={lastInterview} onRetry={() => navigateTo(Screen.INTERVIEW_ROOM)} />;
      case Screen.LEARNING:
        return <Learning />;
      case Screen.JOBS:
        return <Jobs />;
      case Screen.PROFILE:
        return <Profile />;
      default:
        return <Dashboard onStartInterview={() => navigateTo(Screen.INTERVIEW_ROOM)} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden text-slate-800">
      <Sidebar activeScreen={currentScreen} onNavigate={navigateTo} />
      
      <main className="flex-1 flex flex-col min-w-0 relative">
        <Header user={user} currentScreen={currentScreen} />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          {renderScreen()}
        </div>
      </main>
    </div>
  );
};

export default App;
