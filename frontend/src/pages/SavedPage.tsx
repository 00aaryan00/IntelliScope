import React, { useState, useEffect } from 'react';
import { Bookmark, SearchX, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { IntelligenceObjectCard, type IntelligenceObjectCardProps } from '../components/shared/IntelligenceObjectCard';

const container: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function SavedPage() {
  const [savedItems, setSavedItems] = useState<IntelligenceObjectCardProps[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSaved = async () => {
      setIsLoading(true);
      try {
        const { fetchSavedArticles } = await import('../lib/api');
        const saved = await fetchSavedArticles();
        setSavedItems(saved);
      } catch {
        setSavedItems([]);
      }
      setIsLoading(false);
    };
    
    loadSaved();
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <header className="border-b border-slate-200 dark:border-slate-800 pb-6 pr-24">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          Saved Intelligence
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">
          Your personal library of bookmarked items, securely synced to your account.
        </p>
      </header>

      {isLoading ? (
        <div className="flex justify-center items-center py-20 text-blue-600 dark:text-blue-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : savedItems.length > 0 ? (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {savedItems.map((article) => (
            <motion.div key={article.id} variants={item} className="h-full">
              <IntelligenceObjectCard {...article} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Bookmark className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-700" />
          <p>You haven't saved any items yet.</p>
          <p className="text-sm mt-1">Click the bookmark icon on any card to save it here.</p>
        </div>
      )}
    </div>
  );
}
