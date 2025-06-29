export interface DataAgent {
  id: string;
  name: string;
  type: 'sentiment' | 'platform' | 'geographic' | 'competitor' | 'stakeholder' | 'crisis' | 'threat';
  status: 'idle' | 'collecting' | 'processing' | 'completed' | 'error';
  progress: number;
  lastUpdate: Date;
  dataPoints: number;
  errors: string[];
}

export interface AgentSwarm {
  companyName: string;
  startDate: Date;
  endDate: Date;
  agents: DataAgent[];
  overallProgress: number;
  status: 'initializing' | 'collecting' | 'processing' | 'completed' | 'error';
  totalDataPoints: number;
  estimatedCompletion: Date;
}

export interface DataSource {
  name: string;
  type: 'social' | 'news' | 'financial' | 'regulatory' | 'review';
  url?: string;
  apiKey?: string;
  rateLimit: number;
  priority: 'high' | 'medium' | 'low';
}

export interface CollectionMetrics {
  totalMentions: number;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  platformBreakdown: Record<string, number>;
  geographicDistribution: Record<string, number>;
  confidenceScore: number;
  dataQuality: number;
}