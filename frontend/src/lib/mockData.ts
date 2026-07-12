import type { IntelligenceObjectCardProps } from '../components/shared/IntelligenceObjectCard';

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
  },
  {
    id: "funding-2",
    type: "funding",
    title: "Mistral AI secures €600M at €5.8B Valuation",
    source: "Bloomberg",
    timeAgo: "3 days ago",
    aiSummary: "European AI champion Mistral secures massive funding round to compete with US tech giants, focusing on open-weight models.",
    businessImpact: "Low impact. Indicates strong European AI ecosystem but doesn't directly affect our application layer.",
    impactLevel: "low"
  }
];
