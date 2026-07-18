import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, ChevronDown, Loader2 } from 'lucide-react';
import { IntelligenceObjectCard, type IntelligenceType, type IntelligenceObjectCardProps } from '../components/shared/IntelligenceObjectCard';
import { fetchArticles } from '../lib/api';

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
  const [data, setData] = useState<IntelligenceObjectCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const articles = await fetchArticles(typeFilter, 0);
      setData(articles);
      setHasMore(articles.length === 12);
      setIsLoading(false);
    };
    loadData();
  }, [typeFilter]);

  const loadMore = async () => {
    setIsLoadingMore(true);
    const newArticles = await fetchArticles(typeFilter, data.length);
    setData(prev => [...prev, ...newArticles]);
    setHasMore(newArticles.length === 12);
    setIsLoadingMore(false);
  };

  // Filter AI News to only show highly relevant items
  let displayData = data;
  if (typeFilter === 'news') {
    displayData = displayData.filter(item => (item.personalScore || 0) >= 30);
  }
  
  const filteredData = activeFilter === 'All' ? displayData : displayData; // For the MVP, activeFilter can just be cosmetic or we can add actual frontend filtering later.

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

      {isLoading ? (
        <div className="flex justify-center items-center py-20 text-blue-600 dark:text-blue-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : filteredData.length > 0 ? (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {filteredData.map((item) => (
            <motion.div key={item.id} variants={item} className="h-full">
              <IntelligenceObjectCard {...item} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-20 text-slate-500">
          No intelligence objects found for this category.
        </div>
      )}

      {/* Load More Button */}
      {hasMore && filteredData.length > 0 && !isLoading && (
        <div className="flex justify-center pt-8 pb-4">
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="px-6 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoadingMore ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
