import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Flame, Activity, Clock } from 'lucide-react';
import { fetchAlerts } from '../lib/api';

export function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAlerts = async () => {
      const data = await fetchAlerts();
      setAlerts(data);
      setIsLoading(false);
    };
    loadAlerts();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh] text-blue-600 dark:text-blue-400">
        <div className="w-8 h-8 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="text-blue-500" /> Notifications & Alerts
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          High-impact intelligence and breaking events from the last 48 hours.
        </p>
      </header>

      {alerts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-500">
          <Bell className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
          <p>No new alerts in the last 48 hours.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert, idx) => {
            const isTrending = alert.type === 'trending_event';
            return (
              <Link to={`/detail/${alert.id}`} key={`${alert.id}-${idx}`} className="block group">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex gap-4">
                  
                  {/* Icon Badge */}
                  <div className="flex-shrink-0 mt-1">
                    {isTrending ? (
                      <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                        <Flame size={20} />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
                        <Activity size={20} />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4 mb-1">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {alert.title}
                      </h3>
                      <span className="flex-shrink-0 text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-1">
                        <Clock size={12} />
                        {new Date(alert.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    {isTrending ? (
                      <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-medium text-slate-800 dark:text-slate-200">Trending Event:</span> Reported by {alert.articleCount} sources including <span className="italic">{alert.sources.slice(0, 3).join(', ')}</span>.
                      </div>
                    ) : (
                      <div className="mt-2 text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <span className="font-medium text-slate-800 dark:text-slate-200">Critical Intelligence:</span> 
                        Personal Score achieved 
                        <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-bold px-2 py-0.5 rounded text-xs">
                          {alert.score}/100
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
