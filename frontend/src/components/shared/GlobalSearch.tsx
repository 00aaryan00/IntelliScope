import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    const customOpen = () => setIsOpen(true);
    
    window.addEventListener('keydown', down);
    window.addEventListener('open-global-search', customOpen as EventListener);
    
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('open-global-search', customOpen as EventListener);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      // In a real app, this would route to a search results page
      navigate('/news'); 
    }
  };

  return (
    <>
      {/* Floating Mobile Trigger */}
      <button 
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-blue-600 rounded-full shadow-lg shadow-blue-900/50 flex items-center justify-center text-white z-40 hover:bg-blue-500 transition-transform active:scale-95"
      >
        <Search size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[5vh] md:pt-[15vh] px-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/20 dark:bg-slate-950/60 backdrop-blur-sm"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleSearch} className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
                <Search size={20} className="text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  className="flex-1 h-16 bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 px-4 focus:outline-none focus:ring-0 text-lg md:text-xl"
                  placeholder="Ask the AI anything..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <kbd className="hidden md:inline-block px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs rounded border border-slate-200 dark:border-slate-700 font-mono">ESC</kbd>
                </div>
              </form>

              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between px-2 mb-2">
                  <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-medium">
                    <Sparkles size={16} />
                    AI Semantic Search
                  </div>
                </div>
                
                <div className="space-y-1">
                  <button type="button" onClick={() => setIsOpen(false)} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group text-left">
                    <span className="text-slate-700 dark:text-slate-300 text-sm md:text-base">"Which AI startups raised over $50M this week?"</span>
                    <ArrowRight size={16} className="text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-4" />
                  </button>
                  <button type="button" onClick={() => setIsOpen(false)} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group text-left">
                    <span className="text-slate-700 dark:text-slate-300 text-sm md:text-base">"Summarize the latest Arxiv papers on LLM agents"</span>
                    <ArrowRight size={16} className="text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-4" />
                  </button>
                  <button type="button" onClick={() => setIsOpen(false)} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group text-left">
                    <span className="text-slate-700 dark:text-slate-300 text-sm md:text-base">"What are competitors doing in the RAG space?"</span>
                    <ArrowRight size={16} className="text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
