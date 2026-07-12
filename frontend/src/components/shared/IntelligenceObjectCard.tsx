import React from 'react';
import { motion } from 'framer-motion';
import { Newspaper, DollarSign, GraduationCap, Zap, Bookmark, Cpu, Briefcase, Landmark, Code, Terminal, MessageSquare, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export type IntelligenceType = 'news' | 'funding' | 'research' | 'models' | 'vc' | 'gov' | 'opensource' | 'dev' | 'social' | 'business';

export interface IntelligenceObjectCardProps {
  id: string;
  type: IntelligenceType;
  title: string;
  source: string;
  timeAgo: string;
  aiSummary: string;
  businessImpact?: string;
  impactLevel?: 'high' | 'medium' | 'low';
}

const typeConfig: Record<IntelligenceType, { icon: any, color: string, bg: string, label: string }> = {
  news: { icon: Newspaper, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-400/10', label: 'News' },
  funding: { icon: DollarSign, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-400/10', label: 'Funding' },
  research: { icon: GraduationCap, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-400/10', label: 'Research' },
  models: { icon: Cpu, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-400/10', label: 'Models' },
  vc: { icon: Briefcase, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-400/10', label: 'VC Intel' },
  gov: { icon: Landmark, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-400/10', label: 'Gov & Policy' },
  opensource: { icon: Code, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-100 dark:bg-pink-400/10', label: 'Open Source' },
  dev: { icon: Terminal, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-400/10', label: 'Dev Ecosystem' },
  social: { icon: MessageSquare, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-100 dark:bg-sky-400/10', label: 'Social Intel' },
  business: { icon: Building2, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-400/10', label: 'Business' },
};

const impactConfig = {
  high: { border: 'border-orange-200 dark:border-orange-500/50', text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10' },
  medium: { border: 'border-yellow-200 dark:border-yellow-500/50', text: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-500/10' },
  low: { border: 'border-slate-200 dark:border-slate-600', text: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800/50' },
};

export function IntelligenceObjectCard({
  id,
  type,
  title,
  source,
  timeAgo,
  aiSummary,
  businessImpact,
  impactLevel = 'low',
}: IntelligenceObjectCardProps) {
  const config = typeConfig[type];
  const Icon = config.icon;
  const impact = impactConfig[impactLevel];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="group relative bg-white dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg hover:shadow-slate-200 dark:hover:shadow-blue-900/10 transition-all duration-300"
    >
      {/* Save Button */}
      <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity md:block hidden">
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            alert("Sign in to save this intelligence object.");
          }}
          className="p-1.5 bg-white/90 dark:bg-slate-900/80 backdrop-blur border border-slate-200 dark:border-slate-700 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-blue-600 dark:hover:border-blue-500 transition-all shadow-sm"
        >
          <Bookmark size={14} />
        </button>
      </div>

      {/* Mobile visible Save Button */}
      <div className="absolute top-4 right-4 z-10 md:hidden">
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            alert("Sign in to save this intelligence object.");
          }}
          className="p-1.5 bg-white/90 dark:bg-slate-900/80 backdrop-blur border border-slate-200 dark:border-slate-700 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-blue-600 dark:hover:border-blue-500 transition-all shadow-sm"
        >
          <Bookmark size={14} />
        </button>
      </div>

      <Link to={`/detail/${id}`} className="block p-5 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-md ${config.bg} ${config.color}`}>
              <Icon size={16} />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
              <span>{source}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
          {title}
        </h3>

        {/* AI Summary Section */}
        <div className="relative mb-4 bg-slate-50 dark:bg-slate-950/50 rounded-lg p-4 border border-slate-100 dark:border-slate-800/80 flex-1">
          <div className="absolute -top-2 -left-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full p-1 shadow-sm">
            <Zap size={12} className="text-blue-500 dark:text-blue-400 fill-blue-500/20 dark:fill-blue-400/20" />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-2 line-clamp-3">
            {aiSummary}
          </p>
        </div>

        {/* Business Relevance Badge */}
        {businessImpact && (
          <div className={`flex flex-col gap-1.5 p-3 rounded-lg border ${impact.border} ${impact.bg} mt-auto`}>
            <div className="flex items-center gap-2">
              <span className={`font-bold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded border ${impact.border} ${impact.text} bg-white/50 dark:bg-slate-950/50`}>
                Tasknova Impact
              </span>
            </div>
            <p className={`text-xs ${impact.text} leading-snug font-medium line-clamp-2`}>
              {businessImpact}
            </p>
          </div>
        )}
      </Link>
    </motion.div>
  );
}
