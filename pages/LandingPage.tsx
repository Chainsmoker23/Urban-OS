
import React, { useState } from 'react';
import { City3D } from '../components/City3D';
import { Icons } from '../components/Icons';

interface LandingPageProps {
  onEnter: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth) - 0.5;
    const y = (e.clientY / window.innerHeight) - 0.5;
    setMousePos({ x, y });
  };

  return (
    <div className="bg-slate-100 text-slate-900 w-full overflow-x-hidden font-sans" onMouseMove={handleMouseMove}>
      
      {/* HERO SECTION */}
      <section className="relative w-full h-screen overflow-hidden">
        
        {/* 3D Background */}
        <div className="absolute inset-0 z-0">
            <City3D tiltX={mousePos.x} tiltY={mousePos.y} />
        </div>

        {/* Overlay UI */}
        <div className="absolute inset-0 z-10 flex flex-col justify-between pointer-events-none p-12">
            
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg pointer-events-auto">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-slate-700 tracking-widest">COASTAL GRID: ONLINE</span>
                </div>
                <div className="text-right text-white drop-shadow-md">
                    <div className="text-xs uppercase tracking-widest opacity-80">System Status</div>
                    <div className="text-xl font-mono">OPTIMAL</div>
                </div>
            </div>

            {/* Center Hero Text */}
            <div className="text-center space-y-6 pointer-events-auto max-w-4xl mx-auto">
                <h1 className="text-8xl font-black text-white tracking-tighter drop-shadow-2xl scale-y-110"
                    style={{ textShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                    OCEANIC<span className="text-sky-400">.OS</span>
                </h1>
                <p className="text-xl text-slate-100 font-light max-w-xl mx-auto drop-shadow-md bg-slate-900/20 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                    The world's first hydrodynamic urban operating system. 
                    Managing maritime logistics, coastal energy, and hyper-dense skylines.
                </p>
                <button 
                    onClick={onEnter}
                    className="px-10 py-4 bg-white text-slate-900 font-bold rounded-full shadow-[0_0_30px_rgba(14,165,233,0.5)] hover:scale-105 transition-transform"
                >
                    INITIALIZE DASHBOARD
                </button>
            </div>

            {/* Footer Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-3xl bg-white/90 backdrop-blur-lg p-6 rounded-2xl shadow-2xl border border-slate-200 pointer-events-auto">
                <div className="flex items-center space-x-4">
                    <Icons.Wind className="w-8 h-8 text-sky-500" />
                    <div>
                        <div className="text-2xl font-bold text-slate-800">12kts</div>
                        <div className="text-xs text-slate-500 uppercase">Wind Speed</div>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <Icons.Activity className="w-8 h-8 text-emerald-500" />
                    <div>
                        <div className="text-2xl font-bold text-slate-800">98.4%</div>
                        <div className="text-xs text-slate-500 uppercase">Grid Efficiency</div>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <Icons.Globe className="w-8 h-8 text-indigo-500" />
                    <div>
                        <div className="text-2xl font-bold text-slate-800">Active</div>
                        <div className="text-xs text-slate-500 uppercase">Port Status</div>
                    </div>
                </div>
            </div>
        </div>
      </section>
      
      {/* CONTENT SECTION */}
      <section className="py-24 px-6 bg-slate-50 relative z-20">
          <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                  <div>
                      <h2 className="text-5xl font-bold text-slate-900 mb-6">Maritime Intelligence</h2>
                      <p className="text-lg text-slate-600 leading-relaxed mb-8">
                          Seamlessly integrate port logistics with urban traffic flow. 
                          Lumina tracks cargo ships, automated drones, and commercial flights in a single 3D twin.
                      </p>
                      <ul className="space-y-4">
                          {['Real-time Tide Monitoring', 'Autonomous Crane Operations', 'Sky-Traffic Synchronization'].map(item => (
                              <li key={item} className="flex items-center space-x-3 text-slate-700 font-medium">
                                  <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
                                  <span>{item}</span>
                              </li>
                          ))}
                      </ul>
                  </div>
                  <div className="h-96 bg-slate-200 rounded-3xl overflow-hidden relative shadow-inner">
                      {/* Placeholder for feature graphic */}
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2613&auto=format&fit=crop')] bg-cover bg-center opacity-80 grayscale hover:grayscale-0 transition-all duration-700"></div>
                      <div className="absolute bottom-6 left-6 bg-white p-4 rounded-xl shadow-lg">
                          <div className="text-sm font-bold text-slate-900">Feature: Port AI</div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

    </div>
  );
};
