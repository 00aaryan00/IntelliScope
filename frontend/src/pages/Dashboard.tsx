import React from 'react';

export function Dashboard() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Your daily AI & Market Intelligence brief.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Brief Widget (Takes up 2 columns on desktop) */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <h2 className="text-lg font-semibold text-white">Today's AI Brief</h2>
          </div>
          
          <div className="space-y-4">
            <div className="border-l-2 border-blue-600 pl-4 py-1">
              <h3 className="font-medium text-slate-200">OpenAI releases advanced reasoning model</h3>
              <p className="text-sm text-slate-400 mt-1 line-clamp-2">The new o1 model demonstrates significant improvements in coding and math. Highly relevant for Viorant's agent development.</p>
            </div>
            
            <div className="border-l-2 border-orange-500 pl-4 py-1">
              <h3 className="font-medium text-slate-200">CoreWeave secures $1.1B in fresh funding</h3>
              <p className="text-sm text-slate-400 mt-1 line-clamp-2">Valuation hits $19B. Signals massive continued demand for compute infrastructure in the AI sector.</p>
            </div>

            <div className="border-l-2 border-slate-700 pl-4 py-1">
              <h3 className="font-medium text-slate-200">New EU AI Act guidelines published</h3>
              <p className="text-sm text-slate-400 mt-1 line-clamp-2">Compliance requirements for open-source models clarified. Minimal impact expected for current deployments.</p>
            </div>
          </div>
        </div>

        {/* Market Pulse Widget */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-white mb-4">Market Pulse</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Total Funding (24h)</span>
              <span className="text-sm font-medium text-emerald-400">+$1.4B</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">New Papers</span>
              <span className="text-sm font-medium text-white">1,243</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Model Releases</span>
              <span className="text-sm font-medium text-white">4</span>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Trending Topics</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-slate-800 text-xs rounded text-slate-300">Agents</span>
              <span className="px-2 py-1 bg-slate-800 text-xs rounded text-slate-300">RAG</span>
              <span className="px-2 py-1 bg-slate-800 text-xs rounded text-slate-300">Robotics</span>
              <span className="px-2 py-1 bg-slate-800 text-xs rounded text-blue-400 border border-blue-900">Viorant Focus</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
