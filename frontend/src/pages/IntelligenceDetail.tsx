import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Zap, Network, Building2, Code, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchArticleById, fetchSimilarArticles, type IntelligenceObjectDetail } from '../lib/api';
import { type IntelligenceObjectCardProps } from '../components/shared/IntelligenceObjectCard';

export function IntelligenceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState<IntelligenceObjectDetail | null>(null);
  const [similarArticles, setSimilarArticles] = useState<IntelligenceObjectCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadArticle = async () => {
      if (!id) return;
      setIsLoading(true);
      const [article, similar] = await Promise.all([
        fetchArticleById(id),
        fetchSimilarArticles(id)
      ]);
      setData(article);
      setSimilarArticles(similar);
      setIsLoading(false);
    };

    loadArticle();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh] text-blue-600 dark:text-blue-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500 space-y-4">
        <p>Article not found.</p>
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-md hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
          Return Home
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-8 max-w-4xl mx-auto space-y-8"
    >
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none">
        <ArrowLeft size={16} /> Back
      </button>

      <header className="space-y-4 pr-24 relative">
        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <span className="uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400">{data.type}</span>
          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
          <span>{data.source}</span>
          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
          <span>{data.timeAgo}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
          {data.title}
        </h1>
        <div className="pt-2">
          {data.url ? (
            <a href={data.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-medium transition-colors">
              View Original Source <ExternalLink size={14} />
            </a>
          ) : (
            <span className="text-sm text-slate-500">Source URL unavailable</span>
          )}
        </div>
      </header>

      <div className="grid gap-6">
        {/* Full Article Text Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6">
            <h2 className="font-bold text-xl text-slate-900 dark:text-white mb-4">Article Content</h2>
            <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
              {data.content.split('\\n').map((paragraph, idx) => (
                <p key={idx} className="mb-4 leading-relaxed">{paragraph}</p>
              ))}
            </div>
          </div>
        </div>

        {/* AI Analysis Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 dark:bg-slate-950/50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <Zap size={18} className="text-blue-600 dark:text-blue-400" />
            <h2 className="font-semibold text-slate-900 dark:text-white">AI Executive Summary</h2>
          </div>
          <div className="p-6">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
              {data.aiSummary}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Relevance Section */}
          {data.businessImpact && (
            <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-orange-100 dark:bg-orange-500/20 px-6 py-4 border-b border-orange-200 dark:border-orange-500/20 flex items-center gap-2">
                <Building2 size={18} className="text-orange-600 dark:text-orange-400" />
                <h2 className="font-semibold text-orange-700 dark:text-orange-400">Business Impact</h2>
              </div>
              <div className="p-6">
                <p className="text-orange-800 dark:text-orange-200 leading-relaxed">
                  {data.businessImpact}
                </p>
              </div>
            </div>
          )}

          {/* Technical Relevance Section */}
          {data.technicalImpact && (
            <div className="bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-cyan-100 dark:bg-cyan-500/20 px-6 py-4 border-b border-cyan-200 dark:border-cyan-500/20 flex items-center gap-2">
                <Code size={18} className="text-cyan-600 dark:text-cyan-400" />
                <h2 className="font-semibold text-cyan-700 dark:text-cyan-400">Technical Impact</h2>
              </div>
              <div className="p-6">
                <p className="text-cyan-800 dark:text-cyan-200 leading-relaxed">
                  {data.technicalImpact}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Knowledge Graph / Related Objects */}
        {similarArticles.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm mt-8">
            <div className="bg-slate-50 dark:bg-slate-950/50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <Network size={18} className="text-purple-600 dark:text-purple-400" />
              <h2 className="font-semibold text-slate-900 dark:text-white">Related Intelligence</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {similarArticles.map((article) => (
                <div 
                  key={article.id}
                  onClick={() => navigate(`/detail/${article.id}`)}
                  className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer"
                >
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mb-1 uppercase">
                    {article.type}
                  </p>
                  <h3 className="text-sm text-slate-700 dark:text-slate-200 font-medium line-clamp-2">
                    {article.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

