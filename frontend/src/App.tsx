
import React, { useEffect, useState, useRef } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import AIDemoSection from './components/AIDemoSection';
import TargetMarkets from './components/TargetMarkets';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
import ThreeBackground from './components/ThreeBackground';
import MeetingRoom from './components/MeetingRoom';
import SignIn from './components/SignIn';
import Dashboard from './pages/Dashboard';
import InterviewRoom from './pages/InterviewRoom';

interface User {
  name: string;
  email: string;
}

function App() {
  const [view, setView] = useState<'landing' | 'meeting' | 'signin' | 'dashboard' | 'interview'>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const targetX = useRef(0);
  const targetY = useRef(0);
  const cursorCurrentX = useRef(0);
  const cursorCurrentY = useRef(0);
  const followerCurrentX = useRef(0);
  const followerCurrentY = useRef(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const cursor = document.getElementById('custom-cursor');
    const follower = document.getElementById('cursor-follower');

    const handleMouseMove = (e: MouseEvent) => {
      targetX.current = e.clientX;
      targetY.current = e.clientY;
      setMousePos({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement;
      const isInteractive = target.closest('button, a, input, .glass, [role="button"]');

      if (isInteractive) {
        cursor?.classList.add('active');
        follower?.classList.add('active');
      } else {
        cursor?.classList.remove('active');
        follower?.classList.remove('active');
      }
    };

    const animate = () => {
      cursorCurrentX.current += (targetX.current - cursorCurrentX.current) * 0.3;
      cursorCurrentY.current += (targetY.current - cursorCurrentY.current) * 0.3;
      followerCurrentX.current += (targetX.current - followerCurrentX.current) * 0.15;
      followerCurrentY.current += (targetY.current - followerCurrentY.current) * 0.15;

      if (cursor && follower) {
        const cx = cursor.offsetWidth / 2;
        const fx = follower.offsetWidth / 2;
        cursor.style.transform = `translate3d(${cursorCurrentX.current - cx}px, ${cursorCurrentY.current - cx}px, 0)`;
        follower.style.transform = `translate3d(${followerCurrentX.current - fx}px, ${followerCurrentY.current - fx}px, 0)`;
      }
      rafId.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  // Persistence Logic
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setView('dashboard');
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
      }
    }
  }, []);

  const handleSignOut = () => {
    setUser(null);
    setView('landing');
  };

  const handleLogin = (u: User) => {
    setUser(u);
    setView('dashboard');
  };

  if (view === 'signin') {
    return <SignIn onBack={() => setView('landing')} onComplete={handleLogin} />;
  }

  if (view === 'meeting') {
    return <MeetingRoom onExit={() => setView('landing')} onSignOut={handleSignOut} />;
  }

  if (view === 'dashboard') {
    return <Dashboard onNavigate={(v) => setView(v)} onSignOut={handleSignOut} user={user} />;
  }

  if (view === 'interview') {
    return <InterviewRoom onExit={() => setView('dashboard')} onSignOut={handleSignOut} user={user} />;
  }

  return (
    <div className="min-h-screen bg-[#050505] selection:bg-purple-500/30 overflow-x-hidden">
      <ThreeBackground />
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle 800px at ${mousePos.x}px ${mousePos.y}px, rgba(139, 92, 246, 0.05), transparent)`
        }}
      />
      <div className="relative z-10">
        <Navbar
          onJoin={() => setView(user ? 'dashboard' : 'signin')}
          onSignIn={() => setView('signin')}
          user={user}
          onSignOut={handleSignOut}
        />
        <main>
          <Hero onJoin={() => setView(user ? 'dashboard' : 'signin')} />
          <Features />
          <AIDemoSection />
          <TargetMarkets />
          <Pricing onJoin={() => setView(user ? 'dashboard' : 'signin')} />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;

const WrappedApp = () => (
  <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
    <App />
  </GoogleOAuthProvider>
);

export { WrappedApp };
