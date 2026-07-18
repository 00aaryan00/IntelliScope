import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getDashboardData } from '../lib/api';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const dashboardData = await getDashboardData();
      setData(dashboardData);
      setIsLoading(false);
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh] text-blue-600 dark:text-blue-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-[50vh] text-slate-500">
        Failed to load dashboard data.
      </div>
    );
  }

  // Define colors for the Top 3 articles
  const borderColors = ["border-blue-600", "border-orange-500", "border-emerald-500"];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-center mb-8 pr-24">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Your daily AI & Market Intelligence brief.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Brief Widget */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Today's AI Brief</h2>
          </div>
          
          <div className="space-y-4">
            {data.brief.map((article: any, index: number) => (
              <Link to={`/detail/${article.id}`} key={article.id} className="block group">
                <div className={`border-l-2 ${borderColors[index] || 'border-slate-300'} pl-4 py-1 transition-colors group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50 rounded-r-md`}>
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">{article.title}</h3>
                    {article.score > 0 && (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded ml-2 whitespace-nowrap">Score: {article.score}</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{article.summary}</p>
                </div>
              </Link>
            ))}
            {data.brief.length === 0 && (
              <p className="text-sm text-slate-500">No highly relevant articles found today.</p>
            )}
          </div>
        </div>

        {/* Market Pulse Widget */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Market Pulse</h2>
          
          <div className="space-y-4 flex-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500 dark:text-slate-400">New Funding Deals (24h)</span>
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">+{data.pulse.fundingDeals}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500 dark:text-slate-400">New Papers (24h)</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">+{data.pulse.newPapers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500 dark:text-slate-400">Model Releases (24h)</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">+{data.pulse.modelReleases}</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-3">Your Focus Areas</h3>
            <div className="flex flex-wrap gap-2">
              {data.trending.map((tag: string) => (
                <span key={tag} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-xs rounded text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Semantic Clustering: Trending Events */}
      {data.trending_events && data.trending_events.length > 0 && (
        <div className="mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xl">🔥</span>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Trending Events Across Platforms</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.trending_events.map((event: any) => (
              <Link to={`/detail/${event.id}`} key={event.id} className="block group">
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 h-full hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-md transition-all">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
                    {event.title}
                  </h3>
                  <div className="flex flex-col gap-2 mt-auto pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500 font-medium">
                      Reported by {event.articleCount} sources:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {event.sources.slice(0, 3).map((source: string) => (
                        <span key={source} className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                          {source}
                        </span>
                      ))}
                      {event.sources.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                          +{event.sources.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
