
import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut, ChevronDown } from 'lucide-react';
import Logo from './Logo';

interface NavbarProps {
  onJoin?: () => void;
  onSignIn?: () => void;
  onSignOut?: () => void;
  user?: { name: string; email: string } | null;
}

const Navbar: React.FC<NavbarProps> = ({ onJoin, onSignIn, onSignOut, user }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-4' : 'py-6'}`}>
      <div className="container mx-auto px-6">
        <div className={`glass px-6 py-3 rounded-full flex items-center justify-between transition-all duration-300 ${isScrolled ? 'mx-4' : 'mx-0'}`}>
          <div className="flex items-center gap-3">
            <Logo size={32} />
            <span className="text-xl font-bold tracking-tight text-white font-space">AETHER</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Features</a>
            <a href="#demo" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">AI Demo</a>
            <a href="#pricing" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 glass pl-2 pr-4 py-1.5 rounded-full hover:bg-white/10 transition-all border-white/10"
                >
                  <div className="w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center text-[10px] font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[11px] font-bold text-white/80">{user.name}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {showProfileMenu && (
                  <div className="absolute top-full right-0 mt-3 w-48 glass rounded-2xl border-white/5 p-2 shadow-2xl animate-in fade-in slide-in-from-top-2">
                    <button 
                      onClick={onSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-xl transition-all text-xs font-bold"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button 
                  onClick={onSignIn}
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors px-4 py-2"
                >
                  Log In
                </button>
                <button 
                  onClick={onJoin}
                  className="bg-white text-black text-sm font-bold px-6 py-2.5 rounded-full hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-white/10"
                >
                  Launch Demo
                </button>
              </>
            )}
          </div>

          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <div className={`fixed inset-0 bg-black/95 z-40 md:hidden transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col items-center justify-center h-full gap-8">
          <Logo size={80} />
          <a href="#features" className="text-2xl font-space text-white" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="#demo" className="text-2xl font-space text-white" onClick={() => setMobileMenuOpen(false)}>AI Demo</a>
          <a href="#pricing" className="text-2xl font-space text-white" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
          <button onClick={() => { setMobileMenuOpen(false); user ? onSignOut?.() : onSignIn?.(); }} className="bg-white text-black text-lg font-bold px-10 py-4 rounded-full mt-4">
            {user ? 'Sign Out' : 'Launch Demo'}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
