
import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { Shield, Lock, Fingerprint, Mail, Cpu, Orbit, ChevronLeft, X } from 'lucide-react';
import Logo from './Logo';
import BackgroundVideo from './BackgroundVideo';

interface SignInProps {
  onBack: () => void;
  onComplete: (user: { name: string; email: string }) => void;
}

const SignIn: React.FC<SignInProps> = ({ onBack, onComplete }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleSyncing, setIsGoogleSyncing] = useState(false);
  const [step, setStep] = useState<'input' | 'otp' | 'biometric'>('input');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Google Login Hook
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleSyncing(true);
      try {
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await response.json();
        onComplete({ name: userInfo.name, email: userInfo.email });
      } catch (error) {
        console.error('Google login failed:', error);
        setIsGoogleSyncing(false);
      }
    },
    onError: () => {
      console.error('Google login failed');
      setIsGoogleSyncing(false);
    },
  });

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setStep('otp');
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP");

      setStep('biometric');
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));

      setTimeout(() => {
        onComplete({ name: data.user.name, email: data.user.email });
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    googleLogin();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#020202] flex items-center justify-center overflow-hidden scanlines">
      <div className="absolute inset-0 z-0">
        <BackgroundVideo />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />
      </div>

      <div className="absolute top-8 right-8 z-[110]">
        <button
          onClick={onBack}
          className="group glass p-4 rounded-2xl border-white/10 hover:border-red-500/30 hover:bg-red-500/5 transition-all active:scale-90 flex items-center justify-center shadow-2xl"
          aria-label="Close"
        >
          <X className="w-6 h-6 text-white/40 group-hover:text-red-400 transition-colors" />
        </button>
      </div>

      <div className="relative z-10 w-full max-w-lg px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="absolute -top-16 left-0 right-0 flex justify-center">
          <button
            onClick={onBack}
            className="group glass px-6 py-2 rounded-full border-white/10 hover:border-purple-500/30 hover:bg-white/5 transition-all flex items-center gap-3 active:scale-95"
          >
            <ChevronLeft className="w-4 h-4 text-purple-400 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/60 group-hover:text-white transition-colors">Return to Terminal</span>
          </button>
        </div>

        <div className="relative group grain-overlay">
          <div className="absolute -inset-10 bg-purple-600/10 blur-[80px] rounded-full pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />

          <div className="glass-dark p-10 md:p-12 rounded-[48px] border-white/10 relative backdrop-blur-3xl shadow-[0_0_100px_rgba(139,92,246,0.1)] overflow-hidden neon-border">
            <div className="absolute top-6 left-6 w-4 h-4 border-t border-l border-white/20" />
            <div className="absolute top-6 right-6 w-4 h-4 border-t border-r border-white/20" />
            <div className="absolute bottom-6 left-6 w-4 h-4 border-b border-l border-white/20" />
            <div className="absolute bottom-6 right-6 w-4 h-4 border-b border-r border-white/20" />

            <div className="space-y-8 md:space-y-10">
              <div className="flex flex-col items-center">
                <Logo size={80} className="mb-6" />
                <h1 className="text-3xl font-bold font-space tracking-tight mb-2 text-gradient text-center">Establishing Link</h1>
                <p className="text-gray-500 text-[10px] font-bold tracking-[0.4em] uppercase">Auth Protocol Beta 2.5</p>
              </div>

              {step === 'input' && (
                <div className="space-y-6">
                  {error && <div className="text-red-400 text-xs text-center font-bold bg-red-500/10 p-2 rounded-lg">{error}</div>}
                  <form onSubmit={handleSendOTP} className="space-y-4">
                    <div className="relative group">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors">
                        <Mail size={16} />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="USER@AETHER.NEURAL"
                        disabled={isLoading}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-xs font-mono focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all placeholder:text-gray-700 uppercase tracking-widest"
                      />
                    </div>

                    <button disabled={isLoading} className="w-full bg-white text-black font-bold py-5 rounded-2xl hover:bg-gray-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3 group/btn">
                      {isLoading ? (
                        <span className="text-[11px] tracking-[0.3em] uppercase">Sending...</span>
                      ) : (
                        <>
                          <span className="text-[11px] tracking-[0.3em] uppercase">Initiate OTP Sequence</span>
                          <Cpu size={16} className="group-hover/btn:rotate-90 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-white/5"></div>
                    <span className="flex-shrink mx-4 text-[9px] font-bold text-gray-600 uppercase tracking-[0.3em]">Or Connect Via</span>
                    <div className="flex-grow border-t border-white/5"></div>
                  </div>

                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleSyncing}
                    className="w-full glass py-4 rounded-2xl border-white/10 hover:border-white/20 hover:bg-white/5 transition-all flex items-center justify-center gap-3 active:scale-95 group/google disabled:opacity-50"
                  >
                    {isGoogleSyncing ? (
                      <div className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 18 18" className="group-hover/google:scale-110 transition-transform">
                        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                        <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
                        <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.712s.102-1.172.282-1.712V4.956H.957a8.996 8.996 0 000 8.088l3.007-2.332z" fill="#FBBC05" />
                        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.483 0 2.443 2.017.957 4.956L3.964 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335" />
                      </svg>
                    )}
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/80 group-hover:text-white">Sign In with Google</span>
                  </button>
                </div>
              )}

              {step === 'otp' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  {error && <div className="text-red-400 text-xs text-center font-bold bg-red-500/10 p-2 rounded-lg">{error}</div>}
                  <div className="text-center">
                    <p className="text-xs text-purple-300">Enter the cryptographic token sent to {email}</p>
                  </div>
                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div className="relative group">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors">
                        <Lock size={16} />
                      </div>
                      <input
                        type="text"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="000-000"
                        maxLength={6}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-xl tracking-[1em] font-mono focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all placeholder:text-gray-700 text-center"
                      />
                    </div>
                    <button disabled={isLoading} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-5 rounded-2xl hover:scale-[1.02] transition-all shadow-lg flex items-center justify-center gap-3">
                      {isLoading ? "Verifying..." : "Verify Identity Token"}
                    </button>
                  </form>
                  <button onClick={() => setStep('input')} className="w-full text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-white">Cancel Operation</button>
                </div>
              )}

              {step === 'biometric' && (
                <div className="space-y-12 py-4 animate-in zoom-in-95">
                  <div className="flex flex-col items-center">
                    <div className="relative group cursor-pointer">
                      <div className={`w-40 h-40 rounded-full border-2 border-dashed border-purple-500/20 flex items-center justify-center transition-all duration-[3s] animate-spin`}>
                        <div className="w-28 h-28 rounded-full bg-purple-500/5 flex items-center justify-center relative overflow-hidden">
                          <div className="absolute top-0 w-full h-1 bg-purple-500/40 animate-[bounce_2s_infinite] blur-sm" />
                          <Fingerprint size={50} className={`text-purple-300 transition-colors animate-pulse`} />
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-40 h-40 rounded-full border-t-2 border-purple-500 animate-spin" />
                      </div>
                    </div>
                    <div className="mt-8 text-center">
                      <p className="text-[9px] font-bold text-green-400 uppercase tracking-[0.5em] animate-pulse">Identity Confirmed</p>
                      <p className="text-[9px] text-gray-500 mt-2">Redirecting to Dashboard...</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Bar */}
              <div className="pt-10 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Orbit size={14} className="text-purple-400 animate-spin-slow" />
                  <div className="text-left">
                    <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Neural Net Status</p>
                    <p className="text-[10px] font-bold text-green-500">OPTIMAL</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Node Encryption</p>
                    <p className="text-[10px] font-bold text-white">QUANTUM-7</p>
                  </div>
                  <Shield size={14} className="text-blue-400" />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
