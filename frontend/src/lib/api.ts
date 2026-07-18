import type { IntelligenceObjectCardProps } from '../components/shared/IntelligenceObjectCard';

const API_BASE_URL = 'http://localhost:8000/api';

// Helper to map backend format to frontend format
const mapBackendToFrontend = (item: any): IntelligenceObjectCardProps => {
  return {
    id: String(item.id),
    type: item.intelligence?.category || 'news',
    title: item.title,
    source: item.author || new URL(item.url).hostname.replace('www.', ''),
    timeAgo: new Date(item.published_date).toLocaleDateString(),
    aiSummary: item.intelligence?.bullet_points || 'Processing AI summary...',
    businessImpact: item.intelligence?.business_impact,
    impactLevel: (item.intelligence?.personal_score || 0) >= 80 ? 'critical' : ((item.intelligence?.personal_score || 0) >= 60 ? 'high' : ((item.intelligence?.personal_score || 0) >= 30 ? 'medium' : 'low')),
    personalScore: item.intelligence?.personal_score,
    relevanceCategory: item.intelligence?.relevance_category,
    relevanceReason: item.intelligence?.relevance_reason
  };
};

export const fetchArticles = async (category?: string, skip: number = 0, limit: number = 12): Promise<IntelligenceObjectCardProps[]> => {
  try {
    const url = new URL(`${API_BASE_URL}/articles`);
    if (category && category !== 'all') {
      url.searchParams.append('category', category);
    }
    url.searchParams.append('skip', skip.toString());
    url.searchParams.append('limit', limit.toString());
      
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.map(mapBackendToFrontend);
  } catch (error) {
    console.error("Could not fetch articles:", error);
    return [];
  }
};

export const searchArticles = async (query: string): Promise<IntelligenceObjectCardProps[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.map(mapBackendToFrontend);
  } catch (error) {
    console.error("Could not search articles:", error);
    return [];
  }
};

export interface IntelligenceObjectDetail extends IntelligenceObjectCardProps {
  content: string;
  url: string;
  technicalImpact?: string;
}

export const fetchArticleById = async (id: string): Promise<IntelligenceObjectDetail | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/articles/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const item = await response.json();
    
    return {
      ...mapBackendToFrontend(item),
      content: item.content,
      url: item.url,
      technicalImpact: item.intelligence?.technical_impact
    };
  } catch (error) {
    console.error(`Could not fetch article ${id}:`, error);
    return null;
  }
};

export const fetchSimilarArticles = async (id: string): Promise<IntelligenceObjectCardProps[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/articles/${id}/similar`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.map(mapBackendToFrontend);
  } catch (error) {
    console.error(`Could not fetch similar articles for ${id}:`, error);
    return [];
  }
};

export const getCategoryStats = async (): Promise<Record<string, { total: number, new: number }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/stats/categories`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return await response.json();
  } catch (error) {
    console.error("Could not fetch category stats:", error);
    return {};
  }
};

export const getDashboardData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard`);
    if (!response.ok) throw new Error('Failed to fetch dashboard data');
    return await response.json();
  } catch (error) {
    console.error("Could not fetch dashboard data:", error);
    return null;
  }
};

export interface UserProfile {
  focus_tags: string[];
  preferred_locations: string[];
  entities: Array<{
    id?: number;
    name: string;
    competitors: string[];
    target_sectors: string[];
  }>;
}

export const getProfile = async (): Promise<UserProfile | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Could not fetch profile:", error);
    return null;
  }
};

export const updateProfile = async (profile: UserProfile): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    });
    return response.ok;
  } catch (error) {
    console.error("Could not update profile:", error);
    return false;
  }
};

export const fetchAlerts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts`);
    if (!response.ok) throw new Error('Failed to fetch alerts');
    return await response.json();
  } catch (error) {
    console.error("Could not fetch alerts:", error);
    return [];
  }
};
