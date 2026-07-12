import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Zap, Network, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { MOCK_DATA } from '../lib/mockData';

export function IntelligenceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const data = MOCK_DATA.find(d => d.id === id) || MOCK_DATA[0];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-8 max-w-4xl mx-auto space-y-8"
    >
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition-colors focus:outline-none">
        <ArrowLeft size={16} /> Back
      </button>

      <header className="space-y-4">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <span className="uppercase tracking-wider font-semibold text-blue-400">{data.type}</span>
          <span className="w-1 h-1 rounded-full bg-slate-700"></span>
          <span>{data.source}</span>
          <span className="w-1 h-1 rounded-full bg-slate-700"></span>
          <span>{data.timeAgo}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
          {data.title}
        </h1>
        <div className="pt-2">
          <a href="#" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-medium transition-colors">
            View Original Source <ExternalLink size={14} />
          </a>
        </div>
      </header>

      <div className="grid gap-6">
        {/* AI Analysis Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-slate-950/50 px-6 py-4 border-b border-slate-800 flex items-center gap-2">
            <Zap size={18} className="text-blue-400" />
            <h2 className="font-semibold text-white">AI Executive Summary</h2>
          </div>
          <div className="p-6">
            <p className="text-slate-300 leading-relaxed text-lg">
              {data.aiSummary}
            </p>
          </div>
        </div>

        {/* Business Relevance Section */}
        {data.businessImpact && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-orange-500/20 px-6 py-4 border-b border-orange-500/20 flex items-center gap-2">
              <Building2 size={18} className="text-orange-400" />
              <h2 className="font-semibold text-orange-400">Viorant Impact Analysis</h2>
            </div>
            <div className="p-6">
              <p className="text-orange-200 leading-relaxed">
                {data.businessImpact}
              </p>
            </div>
          </div>
        )}

        {/* Knowledge Graph / Related Objects */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm mt-8">
          <div className="bg-slate-950/50 px-6 py-4 border-b border-slate-800 flex items-center gap-2">
            <Network size={18} className="text-purple-400" />
            <h2 className="font-semibold text-white">Related Intelligence</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-800 rounded-lg bg-slate-950 hover:border-slate-600 transition-colors cursor-pointer">
              <p className="text-xs text-purple-400 font-semibold mb-1">RESEARCH PAPER</p>
              <h3 className="text-sm text-slate-200 font-medium">Evaluating LLM Reasoning Capabilities in Coding Tasks</h3>
            </div>
            <div className="p-4 border border-slate-800 rounded-lg bg-slate-950 hover:border-slate-600 transition-colors cursor-pointer">
              <p className="text-xs text-emerald-400 font-semibold mb-1">COMPETITOR</p>
              <h3 className="text-sm text-slate-200 font-medium">Devin by Cognition AI</h3>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
