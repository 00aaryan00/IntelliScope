import React from 'react';
import { motion } from 'framer-motion';
import { IntelligenceObjectCard, type IntelligenceObjectCardProps } from '../components/shared/IntelligenceObjectCard';

export const MOCK_DATA: IntelligenceObjectCardProps[] = [
  {
    id: "news-1",
    type: "news",
    title: "OpenAI releases advanced reasoning model o1",
    source: "OpenAI Blog",
    timeAgo: "2 hours ago",
    aiSummary: "The new o1 model demonstrates significant improvements in coding, math, and multi-step reasoning compared to GPT-4o. It uses a new reinforcement learning paradigm to 'think' before answering.",
    businessImpact: "Highly relevant for Viorant's agent development. O1's reasoning capabilities could significantly reduce the error rate in our autonomous coding agents.",
    impactLevel: "high"
  },
  {
    id: "news-2",
    type: "news",
    title: "Anthropic introduces Claude 3.5 Sonnet with Computer Use",
    source: "Anthropic",
    timeAgo: "5 hours ago",
    aiSummary: "The new model can perceive and interact with computer interfaces directly, moving the cursor, clicking, and typing text just like a human user.",
    businessImpact: "Direct competitor to our core technology. We need to evaluate their agentic capabilities against our proprietary framework.",
    impactLevel: "high"
  },
  {
    id: "research-1",
    type: "research",
    title: "Self-Rewarding Language Models",
    source: "Arxiv",
    timeAgo: "1 day ago",
    aiSummary: "Researchers propose a method where LLMs generate their own rewards during training, potentially bypassing the need for human-in-the-loop alignment.",
    businessImpact: "Medium relevance. Good theoretical background for our future model training pipeline, but not immediately actionable.",
    impactLevel: "medium"
  },
  {
    id: "funding-1",
    type: "funding",
    title: "Perplexity AI raises $73.6M Series B",
    source: "TechCrunch",
    timeAgo: "2 days ago",
    aiSummary: "Search startup Perplexity raises at a $520M valuation led by IVP, with participation from NVIDIA and Jeff Bezos.",
    impactLevel: "low"
  }
];

const container: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function NewsFeed() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <header className="mb-8 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">AI Intelligence Feed</h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          Real-time updates across News, Research, and Funding, automatically scored and summarized for Viorant.
        </p>
      </header>
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {MOCK_DATA.map((data) => (
          <motion.div key={data.id} variants={item} className="h-full">
            <IntelligenceObjectCard {...data} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
