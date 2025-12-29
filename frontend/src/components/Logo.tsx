
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 40, glow = true }) => {
  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer Glow */}
      {glow && (
        <div className="absolute inset-0 bg-purple-500/30 blur-xl rounded-full animate-pulse" />
      )}
      
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full"
      >
        <defs>
          <linearGradient id="aether-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
          <filter id="neon">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Orbit Ring (Slow Rotate) */}
        <circle 
          cx="50" cy="50" r="46" 
          stroke="url(#aether-grad)" 
          strokeWidth="0.5" 
          strokeDasharray="10 20" 
          className="animate-[spin_12s_linear_infinite] opacity-40"
        />

        {/* Inner Dash Ring (Fast Rotate) */}
        <circle 
          cx="50" cy="50" r="40" 
          stroke="white" 
          strokeWidth="1" 
          strokeDasharray="2 10" 
          className="animate-[spin_6s_linear_infinite_reverse] opacity-20"
        />

        {/* Stylized Shard 'A' */}
        <path 
          d="M30 75L48 25L52 25L70 75" 
          stroke="url(#aether-grad)" 
          strokeWidth="8" 
          strokeLinecap="round" 
          filter="url(#neon)"
        />
        <path 
          d="M35 60H65" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round" 
          className="animate-pulse"
          opacity="0.8"
        />
        
        {/* The Neural Core */}
        <circle cx="50" cy="45" r="4" fill="white" className="animate-ping" />
        <circle cx="50" cy="45" r="3" fill="url(#aether-grad)" />
      </svg>
    </div>
  );
};

export default Logo;
