import React from 'react';
import { motion } from 'framer-motion';
import { Hammer } from 'lucide-react';

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-20 h-20 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-lg dark:shadow-xl"
      >
        <Hammer size={32} className="text-blue-500" />
      </motion.div>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">{title}</h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm md:text-base">
        This module is currently in development. Our engineers are hard at work building the ingestion pipelines for this data source.
      </p>
    </div>
  );
}
