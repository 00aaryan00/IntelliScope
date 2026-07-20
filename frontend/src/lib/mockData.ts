import type { IntelligenceObjectCardProps } from '../components/shared/IntelligenceObjectCard';

export const MOCK_DATA: IntelligenceObjectCardProps[] = [
  // --- NEWS ---
  {
    id: "news-1",
    type: "news",
    title: "OpenAI releases advanced reasoning model o1",
    source: "OpenAI Blog",
    timeAgo: "1 hours ago",
    aiSummary: "The new o1 model demonstrates significant improvements in coding, math, and multi-step reasoning compared to GPT-4o.",
    businessImpact: "Highly relevant for Tasknova's agent development.",
    impactLevel: "high"
  },
  {
    id: "news-2",
    type: "news",
    title: "Anthropic introduces Claude 3.5 Sonnet with Computer Use",
    source: "Anthropic",
    timeAgo: "4 hours ago",
    aiSummary: "The new model can perceive and interact with computer interfaces directly, moving the cursor, clicking, and typing text.",
    businessImpact: "Tracked organization to our core technology.",
    impactLevel: "high"
  },

  // --- FUNDING ---
  {
    id: "funding-1",
    type: "funding",
    title: "Perplexity AI raises $73.6M Series B",
    source: "TechCrunch",
    timeAgo: "3 days ago",
    aiSummary: "Search startup Perplexity raises at a $520M valuation led by IVP.",
    impactLevel: "low"
  },
  {
    id: "funding-2",
    type: "funding",
    title: "Mistral AI secures €600M at €5.8B Valuation",
    source: "Bloomberg",
    timeAgo: "3 days ago",
    aiSummary: "European AI champion Mistral secures massive funding round to compete with US tech giants.",
    businessImpact: "Low impact. Indicates strong European AI ecosystem.",
    impactLevel: "low"
  },

  // --- RESEARCH ---
  {
    id: "research-1",
    type: "research",
    title: "Self-Rewarding Language Models",
    source: "Arxiv",
    timeAgo: "1 day ago",
    aiSummary: "Researchers propose a method where LLMs generate their own rewards during training.",
    businessImpact: "Medium relevance for future model training pipeline.",
    impactLevel: "medium"
  },

  // --- MODELS & RELEASES ---
  {
    id: "models-1",
    type: "models",
    title: "Llama 3 400B weights leaked on torrent sites",
    source: "HackerNews",
    timeAgo: "1 hour ago",
    aiSummary: "The highly anticipated open-weight model from Meta appears to have leaked early.",
    businessImpact: "Monitor closely for potential integration into Tasknova backend if officially released.",
    impactLevel: "medium"
  },
  {
    id: "models-2",
    type: "models",
    title: "Google releases Gemini 1.5 Pro to public",
    source: "Google AI",
    timeAgo: "12 hours ago",
    aiSummary: "Gemini 1.5 Pro features a 1M token context window, significantly outperforming GPT-4 in long-context tasks.",
    impactLevel: "high"
  },

  // --- VC INTELLIGENCE ---
  {
    id: "vc-1",
    type: "vc",
    title: "a16z announces new $500M fund dedicated to autonomous agents",
    source: "a16z Blog",
    timeAgo: "1 day ago",
    aiSummary: "Andreessen Horowitz is aggressively betting on agentic workflows replacing traditional SaaS.",
    businessImpact: "Highly relevant. Indicates strong investor appetite for Tasknova's exact market positioning.",
    impactLevel: "high"
  },

  // --- GOVERNMENT ---
  {
    id: "gov-1",
    type: "gov",
    title: "EU AI Act officially enters into force",
    source: "EU Commission",
    timeAgo: "2 days ago",
    aiSummary: "The world's first comprehensive AI law takes effect, classifying AI systems by risk.",
    businessImpact: "Requires audit of Tasknova's data handling to ensure compliance if operating in the EU.",
    impactLevel: "high"
  },

  // --- OPEN SOURCE ---
  {
    id: "os-1",
    type: "opensource",
    title: "LangChain v0.2 released with massive speed improvements",
    source: "GitHub",
    timeAgo: "3 hours ago",
    aiSummary: "The popular AI orchestration framework rewritten in Rust core for 10x throughput.",
    impactLevel: "low"
  },

  // --- DEV ECOSYSTEM ---
  {
    id: "dev-1",
    type: "dev",
    title: "Vercel announces native AI SDK integration",
    source: "Vercel",
    timeAgo: "4 hours ago",
    aiSummary: "Vercel makes it easier to stream LLM responses directly in Next.js applications.",
    businessImpact: "Good to know for our frontend stack optimization.",
    impactLevel: "low"
  },

  // --- SOCIAL INTELLIGENCE ---
  {
    id: "social-1",
    type: "social",
    title: "Trending: 'AI Agents are the new apps' discourse on X",
    source: "X / Twitter",
    timeAgo: "30 mins ago",
    aiSummary: "Major tech influencers are debating the timeline for agentic workflows replacing traditional UI.",
    impactLevel: "medium"
  },

  // --- BUSINESS INTEL ---
  {
    id: "bus-1",
    type: "business",
    title: "Salesforce integrates proprietary agent into CRM",
    source: "WSJ",
    timeAgo: "1 day ago",
    aiSummary: "Salesforce's new 'Einstein Copilot' can autonomously execute multi-step sales workflows.",
    businessImpact: "Enterprise tracked organizations are moving fast into the agent space.",
    impactLevel: "medium"
  }
];
