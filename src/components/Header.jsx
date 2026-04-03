import React from 'react';
import { Shield } from 'lucide-react';

const Header = ({ activeTab, setActiveTab, alertActive }) => {
  return (
    <header className="w-full bg-[#0a0f1d] border-b border-white/5 sticky top-0 z-50 shadow-xl">
      <div className="max-w-[1500px] mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Left Side: Logo & Info */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setActiveTab('monitor')}>
            <Shield className={`w-6 h-6 ${alertActive ? 'text-red-500' : 'text-brand-primary'} transition-colors`} />
            <span className="text-xl font-display font-bold text-white tracking-wide">
              HOPE <span className={`${alertActive ? 'text-red-500' : 'text-brand-primary'} transition-colors uppercase`}>AI</span>
            </span>
          </div>
          <span className="hidden lg:block text-[11px] text-slate-500 font-medium tracking-wide">
            Privacy Mode: Skeleton Only | No Recording
          </span>
        </div>

        {/* Center: Status Badge Pill */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="px-4 py-1.5 bg-[#161b2c] rounded-full flex items-center gap-2 border border-white/5 shadow-inner">
            <div className={`w-1.5 h-1.5 rounded-full ${alertActive ? 'bg-red-500' : 'bg-brand-primary'} animate-pulse`} />
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Privacy Mode: <span className="text-slate-300">Skeleton Only | No Recording</span>
            </span>
          </div>
        </div>

        {/* Right Side: Navigation Buttons */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => setActiveTab('monitor')}
            className={`px-6 py-2 rounded-lg text-sm font-display font-bold transition-all duration-300 ${
              activeTab === 'monitor' 
                ? 'bg-brand-primary text-slate-900 shadow-[0_0_15px_rgba(20,184,166,0.2)]' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Monitor Site
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`text-sm font-display font-bold transition-all duration-300 ${
              activeTab === 'settings' 
                ? 'text-brand-primary' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Configuration
          </button>
        </div>

      </div>
    </header>
  );
};

export default Header;
