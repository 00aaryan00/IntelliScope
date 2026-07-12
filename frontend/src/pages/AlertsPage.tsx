import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Zap, Briefcase, FileText, CheckCircle2 } from 'lucide-react';

const ALERTS = [
  {
    id: 1,
    type: 'critical',
    title: 'OpenAI releases o1 reasoning model',
    description: 'Critical update: This model demonstrates significant improvements in coding and math, directly impacting autonomous agent development timelines.',
    time: '2 hours ago',
    icon: <Zap size={20} className="text-red-500" />,
    read: false,
  },
  {
    id: 2,
    type: 'business',
    title: 'Business Relevance: Viorant Impact',
    description: 'CoreWeave secures $1.1B in fresh funding. This massive compute expansion provides Viorant with opportunities to scale agency client deployments faster and cheaper.',
    time: '5 hours ago',
    icon: <Briefcase size={20} className="text-orange-500" />,
    read: false,
  },
  {
    id: 3,
    type: 'system',
    title: 'Your Daily AI Brief is Ready',
    description: 'We have summarized the top 14 AI news events and 3 major funding rounds from yesterday. Click to view your executive digest.',
    time: 'Today at 8:00 AM',
    icon: <FileText size={20} className="text-blue-500" />,
    read: true,
  },
];

export function AlertsPage() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="border-b border-slate-200 dark:border-slate-800 pb-6 pr-24 flex justify-between items-end">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Notifications</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Critical alerts and personalized business intelligence.</p>
        </div>
        <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
          <CheckCircle2 size={16} /> <span className="hidden md:inline">Mark all as read</span>
        </button>
      </header>

      <div className="space-y-4">
        {ALERTS.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 md:p-6 rounded-xl border flex gap-4 transition-colors ${
              alert.read 
                ? 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800' 
                : 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30'
            }`}
          >
            <div className={`p-3 rounded-full h-fit flex-shrink-0 ${
              alert.read ? 'bg-slate-100 dark:bg-slate-800' : 'bg-white dark:bg-slate-900 shadow-sm'
            }`}>
              {alert.icon}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-start gap-2">
                <h3 className={`font-semibold text-base md:text-lg ${alert.read ? 'text-slate-700 dark:text-slate-200' : 'text-slate-900 dark:text-white'}`}>
                  {alert.title}
                </h3>
                <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                  {alert.time}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed">
                {alert.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
