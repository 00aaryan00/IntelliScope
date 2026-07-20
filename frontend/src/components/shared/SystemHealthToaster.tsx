import React, { useEffect, useState } from 'react';
import { fetchSystemHealth, type SystemHealthRecord } from '../../lib/api';
import { AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SystemHealthToaster() {
  const [errors, setErrors] = useState<SystemHealthRecord[]>([]);

  useEffect(() => {
    let lastErrorSet = new Set<string>();
    
    const checkHealth = async () => {
      const data = await fetchSystemHealth();
      const currentErrors = data.filter(record => record.status === 'error');
      
      // If we have errors that weren't in the last check, show them
      const newErrors = currentErrors.filter(err => !lastErrorSet.has(err.component_name));
      
      if (newErrors.length > 0) {
        setErrors(prev => {
          const combined = [...prev, ...newErrors];
          // Keep only unique components in the toast list
          const unique = Array.from(new Map(combined.map(item => [item.component_name, item])).values());
          return unique;
        });
      }
      
      lastErrorSet = new Set(currentErrors.map(err => err.component_name));
    };

    checkHealth();
    const interval = setInterval(checkHealth, 15000); // Check every 15 seconds
    
    return () => clearInterval(interval);
  }, []);

  const dismissError = (componentName: string) => {
    setErrors(prev => prev.filter(err => err.component_name !== componentName));
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-[100] flex flex-col gap-3">
      <AnimatePresence>
        {errors.map(error => (
          <motion.div
            key={error.component_name}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="bg-white dark:bg-slate-900 border-l-4 border-l-red-500 border border-slate-200 dark:border-slate-800 shadow-xl rounded-lg p-4 flex items-start gap-4 max-w-sm w-full cursor-pointer"
            onClick={() => window.location.href = '/health'}
          >
            <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={20} />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {error.component_name} Error
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {error.message || 'An unknown error occurred in the background worker.'}
              </p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); dismissError(error.component_name); }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
