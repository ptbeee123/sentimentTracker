export interface SentimentData {
  timestamp: Date;
  sentiment: number;
  volume: number;
  platform: string;
  confidence: number;
}

export interface CompanyConfig {
  name: string;
  industry: string;
  competitors: string[];
  subsidiaries: string[];
  executives: string[];
}

export interface KPIMetrics {
  overallSentiment: number;
  recoveryVelocity: number;
  stakeholderConfidence: number;
  competitiveAdvantage: number;
  mediaMomentum: number;
}

export interface PlatformMetrics {
  platform: string;
  sentiment: number;
  volume: number;
  engagement: number;
  reach: number;
  confidence: number;
}

export interface StakeholderSegment {
  segment: string;
  sentiment: number;
  volume: number;
  trend: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface GeographicData {
  region: string;
  sentiment: number;
  volume: number;
  risk: number;
  lat: number;
  lng: number;
}

export interface CompetitorData {
  name: string;
  sentiment: number;
  marketShare: number;
  trend: number;
  advantage: number;
}

export interface CrisisEvent {
  date: Date;
  title: string;
  type: 'announcement' | 'crisis' | 'response' | 'external';
  impact: number;
  description: string;
}

export interface ThreatOpportunity {
  id: string;
  type: 'threat' | 'opportunity';
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  probability: number;
  impact: number;
  timeWindow: string;
  // New fields for verified articles
  verifiedUrl?: string;
  source?: string;
  publishedAt?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface CompanyMetrics {
  sentimentData: SentimentData[];
  hourlyData: SentimentData[];
  kpiMetrics: KPIMetrics;
  platformMetrics: PlatformMetrics[];
  stakeholderSegments: StakeholderSegment[];
  geographicData: GeographicData[];
  competitorData: CompetitorData[];
  crisisEvents: CrisisEvent[];
  threatsOpportunities: ThreatOpportunity[];
  validation: ValidationResult;
}