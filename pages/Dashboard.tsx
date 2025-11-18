
import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { Visualization } from '../components/Visualization';
import { analyzeCityQuery } from '../services/geminiService';
import { AppState, UrbanAnalysisResponse } from '../types';

interface DashboardProps {
  onLogout?: () => void;
}

const Header: React.FC<{ onLogout?: () => void }> = ({ onLogout }) => (
  <header className="fixed top-0 left-0 w-full z-50 border-b border-white/50 bg-white/80 backdrop-blur-xl shadow-sm">
    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <div className="flex items-center space-x-3 group cursor-pointer" onClick={onLogout}>
        <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-lg flex items-center justify-center text-white shadow-lg group-hover:shadow-sky-500/30 transition-all">
          <Icons.Layers className="w-6 h-6" />
        </div>
        <span className="text-slate-800 font-sans font-bold tracking-wider text-lg">LUMINA <span className="text-sky-500 font-light">OS</span></span>
      </div>
      <nav className="hidden md:flex items-center space-x-8">
        {['Live Map', 'Analytics', 'Grid Control', 'Settings'].map((item) => (
          <button key={item} className="text-sm text-slate-500 hover:text-sky-600 transition-colors font-medium">
            {item}
          </button>
        ))}
      </nav>
    </div>
  </header>
);

const AnalysisCard = ({ title, children, className = '' }: { title: string, children?: React.ReactNode, className?: string }) => (
  <div className={`glass-panel p-6 rounded-2xl relative overflow-hidden group transition-all hover:shadow-lg ${className}`}>
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xs font-bold text-sky-600 tracking-widest uppercase flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
        {title}
      </h3>
      <Icons.Maximize2 className="w-4 h-4 text-slate-300 cursor-pointer hover:text-sky-500" />
    </div>
    {children}
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [query, setQuery] = useState('');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [analysis, setAnalysis] = useState<UrbanAnalysisResponse | null>(null);

  const handleAnalyze = async () => {
    if (!query.trim()) return;
    setAppState(AppState.ANALYZING);
    
    try {
      const result = await analyzeCityQuery(query);
      setAnalysis(result);
      setAppState(AppState.COMPLETE);
    } catch (e) {
      setAppState(AppState.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-600 relative animate-in fade-in duration-700">
      {/* Background Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-sky-200/30 rounded-full blur-[120px]"></div>
          <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-emerald-200/30 rounded-full blur-[120px]"></div>
      </div>

      <Header onLogout={onLogout} />

      <main className="relative z-10 pt-32 px-6 pb-20 max-w-7xl mx-auto">
        
        <section className="mb-16 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-slate-900 mb-6">
            City Intelligence
          </h1>
          
          {/* Search Input */}
          <div className="relative group shadow-2xl shadow-sky-900/5 rounded-2xl">
            <div className="relative flex items-center bg-white rounded-2xl p-2 border border-white ring-1 ring-slate-200 focus-within:ring-sky-400 transition-all">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder="Ask Lumina to analyze grid efficiency, traffic patterns..." 
                className="w-full bg-transparent border-none focus:ring-0 text-slate-800 placeholder-slate-400 text-lg h-14 px-4"
              />
              <button 
                onClick={handleAnalyze}
                disabled={appState === AppState.ANALYZING}
                className="h-12 px-6 bg-slate-900 text-white rounded-xl hover:bg-sky-600 transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {appState === AppState.ANALYZING ? <Icons.Activity className="animate-spin" /> : <Icons.ArrowRight />}
              </button>
            </div>
          </div>
        </section>

        {(appState === AppState.COMPLETE || appState === AppState.ANALYZING) && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-10 duration-700">
            
            <div className="lg:col-span-8 space-y-8">
              <AnalysisCard title="Executive Summary">
                 <div className="prose prose-slate max-w-none">
                    <p className="text-lg leading-relaxed text-slate-700">
                       {analysis?.summary || "Simulating urban parameters..."}
                    </p>
                 </div>
                 {analysis && (
                   <div className="mt-6 flex gap-4 flex-wrap">
                      {analysis.keyInsights.map((insight, i) => (
                          <div key={i} className="bg-sky-50 text-sky-800 px-4 py-2 rounded-lg text-sm font-medium border border-sky-100">
                              {insight}
                          </div>
                      ))}
                   </div>
                 )}
              </AnalysisCard>

              <AnalysisCard title="Data Visualization">
                 <Visualization 
                    data={analysis?.metrics || []} 
                    type="area" 
                    isLoading={appState === AppState.ANALYZING}
                 />
              </AnalysisCard>
            </div>

            <div className="lg:col-span-4 space-y-8">
               <AnalysisCard title="Real-Time Metrics">
                  <div className="space-y-4">
                     {analysis?.metrics.map((m, i) => (
                        <div key={i} className="flex justify-between items-baseline pb-3 border-b border-slate-100 last:border-0">
                           <span className="text-sm font-medium text-slate-500">{m.label}</span>
                           <span className="text-xl font-bold text-slate-900">{m.value}<span className="text-xs text-slate-400 ml-1">{m.unit}</span></span>
                        </div>
                     ))}
                     {!analysis && <div className="text-center text-slate-400 py-10">Loading stream...</div>}
                  </div>
               </AnalysisCard>

               {analysis && (
                 <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-2">Sustainability Score</div>
                        <div className="text-7xl font-bold tracking-tighter">{analysis.sustainabilityScore}</div>
                    </div>
                    <Icons.Globe className="absolute -bottom-6 -right-6 w-40 h-40 text-white opacity-10" />
                 </div>
               )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
