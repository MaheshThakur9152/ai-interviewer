
import React from 'react';
import { Check, ShieldCheck } from 'lucide-react';

interface PricingProps {
  onJoin?: () => void;
}

const Pricing: React.FC<PricingProps> = ({ onJoin }) => {
  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 font-space tracking-tight">Simple, Transparent Pricing</h2>
          <p className="text-gray-400">The next level of communication shouldn't be complicated.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="glass p-10 rounded-3xl border-white/5 hover:border-white/10 transition-all flex flex-col">
            <h3 className="text-xl font-bold mb-2">Personal</h3>
            <div className="text-4xl font-bold mb-6 font-space">$0 <span className="text-sm font-normal text-gray-500">/ forever</span></div>
            <ul className="space-y-4 mb-10 flex-1">
              {['Unlimited 1-on-1 calls', 'HD Video & Audio', '10 AI sessions / month', 'Shared Whiteboard', '7-day transcript memory'].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm text-gray-400">
                  <Check className="w-4 h-4 text-green-500" />
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={onJoin} className="w-full py-4 rounded-full border border-white/10 hover:bg-white/5 transition-all font-bold">
              Start for Free
            </button>
          </div>

          {/* Pro Tier */}
          <div className="glass p-10 rounded-3xl border-purple-500/30 bg-purple-500/5 relative flex flex-col scale-105 shadow-2xl shadow-purple-500/10">
            <div className="absolute top-0 right-0 p-6">
              <div className="bg-purple-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest text-white">Popular</div>
            </div>
            <h3 className="text-xl font-bold mb-2">Aether Pro</h3>
            <div className="text-4xl font-bold mb-6 font-space">$19 <span className="text-sm font-normal text-gray-500">/ per month</span></div>
            <ul className="space-y-4 mb-10 flex-1">
              {[
                'Unlimited group calls (up to 100)', 
                'Infinite AI participation', 
                '4K Video quality', 
                'Full meeting memory (Eternal)', 
                'AI Clip generation',
                'Priority Support'
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm text-gray-200">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={onJoin} className="w-full py-4 rounded-full bg-white text-black hover:bg-gray-200 transition-all font-bold shadow-lg shadow-white/10">
              Launch Pro Demo
            </button>
          </div>
        </div>

        {/* CTA Strip */}
        <div className="mt-32 glass p-12 rounded-[40px] text-center border-purple-500/10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 font-space leading-tight">Be part of the next <br/>communication revolution.</h2>
          <button onClick={onJoin} className="bg-white text-black font-bold px-12 py-5 rounded-full hover:scale-105 active:scale-95 transition-all text-lg shadow-2xl shadow-white/10">
            Join 50,000+ early users
          </button>
          <p className="mt-6 text-sm text-gray-500">No credit card required for early access.</p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
