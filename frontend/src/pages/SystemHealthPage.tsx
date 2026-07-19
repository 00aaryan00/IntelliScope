import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle2, XCircle, Clock, Loader2, RefreshCw } from 'lucide-react';
import { fetchSystemHealth, type SystemHealthRecord } from '../lib/api';

const container: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

export function SystemHealthPage() {
  const [healthData, setHealthData] = useState<SystemHealthRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchSystemHealth();
    setHealthData(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    // Poll every 10 seconds for real-time updates
    const interval = setInterval(() => {
      fetchSystemHealth().then(data => setHealthData(data));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <header className="border-b border-slate-200 dark:border-slate-800 pb-6 pr-24 flex justify-between items-end">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2 flex items-center gap-3">
            <Activity className="text-blue-500" /> System Health
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">
            Real-time observability dashboard for background scrapers and AI workers.
          </p>
        </div>
        <button 
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </header>
      
      {isLoading && healthData.length === 0 ? (
        <div className="flex justify-center items-center py-20 text-blue-600 dark:text-blue-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {healthData.map((record) => {
            const isError = record.status === 'error';
            const isRunning = record.status === 'running';
            
            return (
              <motion.div
                key={record.component_name}
                variants={item}
                className={`relative overflow-hidden bg-white dark:bg-slate-900/50 backdrop-blur-sm border rounded-xl p-6 transition-all shadow-sm ${
                  isError 
                    ? 'border-red-300 dark:border-red-500/50 shadow-red-900/10' 
                    : isRunning
                    ? 'border-yellow-300 dark:border-yellow-500/50 shadow-yellow-900/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-blue-900/10'
                }`}
              >
                {isRunning && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400 dark:bg-yellow-500 animate-pulse" />
                )}
                {isError && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
                )}
                
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {record.component_name}
                  </h3>
                  <div className={`p-1.5 rounded-full ${
                    isError ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' :
                    isRunning ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 animate-pulse' :
                    'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {isError ? <XCircle size={20} /> : isRunning ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className={`text-sm font-medium p-3 rounded-lg border ${
                    isError 
                      ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-800 dark:text-red-300' 
                      : isRunning
                      ? 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20 text-yellow-800 dark:text-yellow-300'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50 text-slate-600 dark:text-slate-300'
                  }`}>
                    {record.message || 'Running smoothly'}
                  </div>

                  {record.metrics && Object.keys(record.metrics).length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {Object.entries(record.metrics).map(([key, value]) => (
                        <div key={key} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-lg p-2.5 flex flex-col items-start justify-center">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-1">
                            {key}
                          </span>
                          <span className={`text-lg font-black ${
                            key.includes('Score > 30') || key.includes('Saved') ? 'text-emerald-500 dark:text-emerald-400' :
                            key.includes('Noise') ? 'text-rose-500 dark:text-rose-400' :
                            'text-slate-700 dark:text-slate-200'
                          }`}>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium pt-2">
                    <Clock size={14} />
                    <span>Last run: {record.last_run ? getTimeAgo(record.last_run) : 'Never'}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
