import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, SearchX, Sparkles } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { IntelligenceObjectCard, type IntelligenceObjectCardProps } from '../components/shared/IntelligenceObjectCard';
import { searchArticles } from '../lib/api';

const container: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [data, setData] = useState<IntelligenceObjectCardProps[]>([]);
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      if (!query) {
        setData([]);
        setAnswer(null);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      const results = await searchArticles(query);
      if (results) {
        setData(results.results);
        setAnswer(results.answer);
      } else {
        setData([]);
        setAnswer(null);
      }
      setIsLoading(false);
    };

    loadResults();
  }, [query]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <header className="border-b border-slate-200 dark:border-slate-800 pb-6 pr-24">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          Search Results
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">
          {query ? `Showing semantic AI results for "${query}"` : 'Enter a query in the global search to find intelligence.'}
        </p>
      </header>

      {isLoading ? (
        <div className="flex justify-center items-center py-20 text-blue-600 dark:text-blue-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : data.length > 0 ? (
        <div className="space-y-8">
          {/* AI Answer Block */}
          {answer && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/50 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3 text-blue-600 dark:text-blue-400 font-semibold">
                <Sparkles size={20} />
                <h2>AI Synthesized Answer</h2>
              </div>
              <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed">
                {answer.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-2">{paragraph}</p>
                ))}
              </div>
            </motion.div>
          )}

          {/* Source Articles Grid */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-1">
              Source Intelligence
            </h3>
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {data.map((article) => (
                <motion.div key={article.id} variants={item} className="h-full">
                  <IntelligenceObjectCard {...article} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <SearchX className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-700" />
          <p>No results found for "{query}".</p>
          <p className="text-sm mt-1">Try rewording your query or making it more general.</p>
        </div>
      )}
    </div>
  );
}
