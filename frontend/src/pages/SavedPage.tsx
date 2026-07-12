import { Bookmark, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function SavedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-20 h-20 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-lg dark:shadow-xl relative"
      >
        <Bookmark size={32} className="text-blue-500" />
        <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1.5 shadow-sm">
          <Lock size={12} className="text-slate-400" />
        </div>
      </motion.div>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">Saved Intelligence</h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6 text-sm md:text-base">
        You must be signed in to save and organize your personalized intelligence objects.
      </p>
      <button onClick={() => navigate('/login')} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg shadow-sm transition-colors">
        Sign In to Continue
      </button>
    </div>
  );
}
