
import React from 'react';
import { Twitter, Instagram, Linkedin, Github } from 'lucide-react';
import Logo from './Logo';

const Footer: React.FC = () => {
  return (
    <footer className="py-20 border-t border-white/5 relative bg-black">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Logo size={32} />
              <span className="text-xl font-bold tracking-tight text-white font-space">AETHER</span>
            </div>
            <p className="text-gray-500 max-w-xs leading-relaxed text-sm">
              Redefining how the world connects. Built for teams that move fast and creators who think ahead.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">Product</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Enterprise</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">Company</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="p-2 glass rounded-lg hover:bg-white/10 transition-all text-gray-400 hover:text-white"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="p-2 glass rounded-lg hover:bg-white/10 transition-all text-gray-400 hover:text-white"><Github className="w-5 h-5" /></a>
              <a href="#" className="p-2 glass rounded-lg hover:bg-white/10 transition-all text-gray-400 hover:text-white"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
          <p>© 2024 Aether Communications, Inc. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-gray-400">Terms of Service</a>
            <a href="#" className="hover:text-gray-400">Privacy Policy</a>
            <a href="#" className="hover:text-gray-400">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
