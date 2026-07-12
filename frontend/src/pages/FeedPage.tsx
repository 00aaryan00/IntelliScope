import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, ChevronDown } from 'lucide-react';
import { IntelligenceObjectCard, type IntelligenceType } from '../components/shared/IntelligenceObjectCard';
import { MOCK_DATA } from '../lib/mockData';

interface FeedPageProps {
  title: string;
  description: string;
  typeFilter: IntelligenceType;
}

const container: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function FeedPage({ title, description, typeFilter }: FeedPageProps) {
  const filteredData = MOCK_DATA.filter(data => data.type === typeFilter);
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Today', 'High Priority', 'Critical', 'OpenAI', 'Anthropic', 'Funding > $50M'];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <header className="border-b border-slate-200 dark:border-slate-800 pb-6 pr-24">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">{title}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">{description}</p>
      </header>
      
      {/* Filter and Sort Bar */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full pr-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mr-2 flex-shrink-0">
            <Filter size={16} />
          </div>
          {filters.map(f => (
            <button 
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium border transition-colors flex-shrink-0 ${
                activeFilter === f 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-sm shadow-blue-900/20' 
                  : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button className="hidden md:flex items-center gap-2 whitespace-nowrap px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex-shrink-0">
          Sort: Newest <ChevronDown size={14} />
        </button>
      </div>

      {filteredData.length > 0 ? (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {filteredData.map((data) => (
            <motion.div key={data.id} variants={item} className="h-full">
              <IntelligenceObjectCard {...data} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-20 text-slate-500">
          No intelligence objects found for this category.
        </div>
      )}
    </div>
  );
}
