import { format, subDays, subHours, addDays, startOfYear } from 'date-fns';
import type { 
  SentimentData, 
  KPIMetrics, 
  PlatformMetrics, 
  StakeholderSegment, 
  GeographicData, 
  CompetitorData, 
  CrisisEvent, 
  ThreatOpportunity,
  CompanyMetrics,
  ValidationResult
} from '../types/dashboard';
import { validateCompanyName, validateCompanyMetrics } from './validation';
import { validatorAgent } from '../services/validatorAgent';
import { crisisValidationService } from '../services/crisisValidationService';

// Company-specific data generation based on company name and industry context
const getCompanyContext = (companyName: string) => {
  const name = companyName.toLowerCase();
  
  // Industry classification based on company name patterns
  let industry = 'technology';
  let baseRisk = 0.5;
  let marketPosition = 'established';
  
  if (name.includes('bank') || name.includes('financial') || name.includes('capital')) {
    industry = 'financial';
    baseRisk = 0.7;
  } else if (name.includes('pharma') || name.includes('bio') || name.includes('health')) {
    industry = 'healthcare';
    baseRisk = 0.6;
  } else if (name.includes('energy') || name.includes('oil') || name.includes('gas')) {
    industry = 'energy';
    baseRisk = 0.8;
  } else if (name.includes('retail') || name.includes('consumer')) {
    industry = 'retail';
    baseRisk = 0.4;
  } else if (name.includes('auto') || name.includes('motor')) {
    industry = 'automotive';
    baseRisk = 0.6;
  }
  
  // Market position assessment
  if (name.includes('global') || name.includes('international') || name.includes('corp')) {
    marketPosition = 'dominant';
  } else if (name.includes('tech') || name.includes('innovation') || name.includes('digital')) {
    marketPosition = 'growth';
  }
  
  return { industry, baseRisk, marketPosition };
};

const generateCompanySpecificSeed = (companyName: string): number => {
  let hash = 0;
  for (let i = 0; i < companyName.length; i++) {
    const char = companyName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) / 2147483647; // Normalize to 0-1
};

// FIXED: Company-specific crisis timing calculation
const getCompanyCrisisDay = (companyName: string): number => {
  const companySeed = generateCompanySpecificSeed(companyName);
  const context = getCompanyContext(companyName);
  
  // Different industries have different crisis patterns
  let baseCrisisDay: number;
  switch (context.industry) {
    case 'technology':
      baseCrisisDay = 180; // Tech crises often happen mid-year
      break;
    case 'financial':
      baseCrisisDay = 120; // Financial crises often in Q2
      break;
    case 'healthcare':
      baseCrisisDay = 200; // Healthcare crises often later in year
      break;
    case 'energy':
      baseCrisisDay = 150; // Energy crises often in summer
      break;
    default:
      baseCrisisDay = 160;
  }
  
  // Add company-specific variation (±60 days)
  const variation = Math.floor((companySeed - 0.5) * 120);
  return Math.max(30, Math.min(300, baseCrisisDay + variation));
};

export const generateSentimentTimeSeries = (days: number = 365, companyName: string = 'GlobalTech Industries'): SentimentData[] => {
  const data: SentimentData[] = [];
  const startDate = new Date('2025-01-01T00:00:00Z'); // Start from January 1, 2025
  const context = getCompanyContext(companyName);
  const companySeed = generateCompanySpecificSeed(companyName);
  
  // FIXED: Use company-specific crisis timing
  const crisisDay = getCompanyCrisisDay(companyName);
  const recoveryRate = context.industry === 'technology' ? 1.2 : 
                      context.industry === 'financial' ? 0.8 : 1.0;
  
  for (let i = 0; i < days; i++) {
    const date = addDays(startDate, i);
    const daysSinceCrisis = i - crisisDay;
    
    let baseScore: number;
    
    if (i < crisisDay) {
      // Pre-crisis: Generally positive with industry-specific variations
      baseScore = 15 + (companySeed * 30) - (context.baseRisk * 20);
    } else if (daysSinceCrisis < 7) {
      // Crisis peak: Severe negative sentiment
      baseScore = -75 - (context.baseRisk * 20) + (companySeed * 10);
    } else {
      // Recovery phase: Gradual improvement with company-specific recovery rate
      const recoveryProgress = Math.min(1, (daysSinceCrisis - 7) / 60);
      const targetScore = -10 + (companySeed * 20) - (context.baseRisk * 15);
      baseScore = -65 + (recoveryProgress * (targetScore + 65) * recoveryRate);
    }
    
    // Add realistic noise and weekly patterns
    const weeklyPattern = Math.sin((i % 7) * Math.PI / 3.5) * 3;
    const noise = (Math.random() - 0.5) * 8;
    const finalScore = baseScore + weeklyPattern + noise;
    
    // Volume calculation based on crisis proximity and company size
    const baseVolume = context.marketPosition === 'dominant' ? 2000 : 
                      context.marketPosition === 'growth' ? 1200 : 800;
    const crisisMultiplier = Math.abs(daysSinceCrisis) < 14 ? 3 : 1;
    const volume = baseVolume * crisisMultiplier * (0.8 + companySeed * 0.4) + Math.random() * 500;
    
    data.push({
      timestamp: date,
      sentiment: Math.round(Math.max(-100, Math.min(100, finalScore))), // Round to whole number
      volume: Math.floor(volume),
      platform: 'aggregate',
      confidence: 0.82 + (companySeed * 0.15) + Math.random() * 0.08
    });
  }
  
  return data;
};

export const generateHourlyData = (companyName: string = 'GlobalTech Industries'): SentimentData[] => {
  const data: SentimentData[] = [];
  const now = new Date();
  const context = getCompanyContext(companyName);
  const companySeed = generateCompanySpecificSeed(companyName);
  
  // Current sentiment baseline based on company context
  const currentBaseline = -15 + (companySeed * 25) - (context.baseRisk * 20);
  
  for (let i = 24; i >= 0; i--) {
    const date = subHours(now, i);
    const hourOfDay = date.getHours();
    
    // Business hours activity pattern
    const businessHoursMultiplier = (hourOfDay >= 9 && hourOfDay <= 17) ? 1.3 : 0.7;
    const sentiment = currentBaseline + (Math.random() - 0.5) * 15;
    const volume = Math.floor((100 + companySeed * 200) * businessHoursMultiplier + Math.random() * 150);
    
    data.push({
      timestamp: date,
      sentiment: Math.round(Math.max(-100, Math.min(100, sentiment))), // Round to whole number
      volume: volume,
      platform: 'aggregate',
      confidence: 0.85 + companySeed * 0.1 + Math.random() * 0.08
    });
  }
  
  return data;
};

export const getMockKPIs = (companyName: string = 'GlobalTech Industries'): KPIMetrics => {
  const context = getCompanyContext(companyName);
  const companySeed = generateCompanySpecificSeed(companyName);
  
  // Industry-specific KPI baselines
  const industryMultipliers = {
    technology: { sentiment: 1.1, velocity: 1.2, confidence: 1.0, advantage: 1.1, momentum: 1.3 },
    financial: { sentiment: 0.8, velocity: 0.9, confidence: 0.7, advantage: 0.9, momentum: 0.8 },
    healthcare: { sentiment: 0.9, velocity: 1.0, confidence: 0.8, advantage: 1.0, momentum: 1.0 },
    energy: { sentiment: 0.7, velocity: 0.8, confidence: 0.6, advantage: 0.8, momentum: 0.7 },
    retail: { sentiment: 1.0, velocity: 1.1, confidence: 0.9, advantage: 1.0, momentum: 1.2 },
    automotive: { sentiment: 0.9, velocity: 1.0, confidence: 0.8, advantage: 0.9, momentum: 0.9 }
  };
  
  const multipliers = industryMultipliers[context.industry] || industryMultipliers.technology;
  
  return {
    overallSentiment: Math.round(Math.max(-100, Math.min(100, (-30 + companySeed * 40) * multipliers.sentiment))), // Round to whole number
    recoveryVelocity: Math.round(Math.max(0, Math.min(100, (50 + companySeed * 30) * multipliers.velocity))), // Round to whole number
    stakeholderConfidence: Math.round(Math.max(0, Math.min(100, (25 + companySeed * 40) * multipliers.confidence))), // Round to whole number
    competitiveAdvantage: Math.round(Math.max(-100, Math.min(100, (-20 + companySeed * 35) * multipliers.advantage))), // Round to whole number
    mediaMomentum: Math.round(Math.max(0, Math.min(100, (35 + companySeed * 40) * multipliers.momentum))) // Round to whole number
  };
};

export const getMockPlatformMetrics = (companyName: string = 'GlobalTech Industries'): PlatformMetrics[] => {
  const context = getCompanyContext(companyName);
  const companySeed = generateCompanySpecificSeed(companyName);
  
  // Platform-specific performance based on industry
  const platformData = [
    { 
      platform: 'Twitter/X', 
      baseVolume: context.industry === 'technology' ? 18000 : 12000,
      sentimentModifier: context.industry === 'financial' ? -10 : 0
    },
    { 
      platform: 'LinkedIn', 
      baseVolume: context.industry === 'financial' ? 8000 : 3000,
      sentimentModifier: context.industry === 'technology' ? 5 : 0
    },
    { 
      platform: 'Facebook', 
      baseVolume: context.industry === 'retail' ? 15000 : 8000,
      sentimentModifier: context.industry === 'healthcare' ? -5 : 0
    },
    { 
      platform: 'Reddit', 
      baseVolume: context.industry === 'technology' ? 15000 : 8000,
      sentimentModifier: context.industry === 'energy' ? -15 : -5
    },
    { 
      platform: 'YouTube', 
      baseVolume: 2000,
      sentimentModifier: 0
    },
    { 
      platform: 'News Media', 
      baseVolume: 1200,
      sentimentModifier: context.industry === 'financial' ? -8 : -3
    }
  ];
  
  return platformData.map((platform, index) => {
    const platformSeed = (companySeed + index * 0.1) % 1;
    const volume = Math.floor(platform.baseVolume * (0.7 + companySeed * 0.6));
    const baseSentiment = -25 + (companySeed * 30) + platform.sentimentModifier;
    
    return {
      platform: platform.platform,
      sentiment: Math.round(Math.max(-100, Math.min(100, baseSentiment + (platformSeed - 0.5) * 20))), // Round to whole number
      volume: Math.max(0, volume),
      engagement: Math.max(0, Math.min(100, Number((1.5 + platformSeed * 8).toFixed(1)))),
      reach: Math.max(0, Math.floor((400000 + platformSeed * 1600000) * (context.marketPosition === 'dominant' ? 1.5 : 1))),
      confidence: Math.max(0, Math.min(1, Number((0.82 + platformSeed * 0.15).toFixed(2))))
    };
  });
};

export const getMockStakeholderSegments = (companyName: string = 'GlobalTech Industries'): StakeholderSegment[] => {
  const context = getCompanyContext(companyName);
  const companySeed = generateCompanySpecificSeed(companyName);
  
  const segments = [
    { 
      segment: 'Customers', 
      baseVolume: context.industry === 'retail' ? 25000 : 18000,
      priorityModifier: context.industry === 'retail' ? 'critical' : 'high'
    },
    { 
      segment: 'Investors', 
      baseVolume: context.marketPosition === 'dominant' ? 6000 : 4000,
      priorityModifier: 'critical'
    },
    { 
      segment: 'Employees', 
      baseVolume: 3500,
      priorityModifier: 'medium'
    },
    { 
      segment: 'Regulators', 
      baseVolume: context.industry === 'financial' ? 800 : 300,
      priorityModifier: context.industry === 'financial' || context.industry === 'energy' ? 'critical' : 'high'
    },
    { 
      segment: 'Partners', 
      baseVolume: 2000,
      priorityModifier: 'medium'
    },
    { 
      segment: 'Media', 
      baseVolume: 1200,
      priorityModifier: 'high'
    }
  ];
  
  return segments.map((segment, index) => {
    const segmentSeed = (companySeed + index * 0.15) % 1;
    const volume = Math.floor(segment.baseVolume * (0.6 + companySeed * 0.8));
    const baseSentiment = -30 + (companySeed * 40);
    
    // Industry-specific sentiment adjustments
    let sentimentAdjustment = 0;
    if (segment.segment === 'Regulators' && (context.industry === 'financial' || context.industry === 'energy')) {
      sentimentAdjustment = -15;
    } else if (segment.segment === 'Customers' && context.industry === 'technology') {
      sentimentAdjustment = 5;
    }
    
    return {
      segment: segment.segment,
      sentiment: Math.round(Math.max(-100, Math.min(100, baseSentiment + sentimentAdjustment + (segmentSeed - 0.5) * 25))), // Round to whole number
      volume: Math.max(0, volume),
      trend: Math.round(Math.max(-100, Math.min(100, (segmentSeed - 0.5) * 30))), // Round to whole number
      priority: segment.priorityModifier as 'critical' | 'high' | 'medium' | 'low'
    };
  });
};

export const getMockGeographicData = (companyName: string = 'GlobalTech Industries'): GeographicData[] => {
  const context = getCompanyContext(companyName);
  const companySeed = generateCompanySpecificSeed(companyName);
  
  const regions = [
    { region: 'North America', baseVolume: 35000, riskModifier: 0 },
    { region: 'Europe', baseVolume: 20000, riskModifier: context.industry === 'technology' ? -5 : 5 },
    { region: 'Asia Pacific', baseVolume: 18000, riskModifier: context.industry === 'financial' ? 10 : 0 },
    { region: 'Latin America', baseVolume: 6000, riskModifier: 0 },
    { region: 'Middle East', baseVolume: 3000, riskModifier: context.industry === 'energy' ? -10 : 5 },
    { region: 'Africa', baseVolume: 2500, riskModifier: -5 }
  ];
  
  return regions.map((region, index) => {
    const regionSeed = (companySeed + index * 0.2) % 1;
    const volume = Math.floor(region.baseVolume * (0.5 + companySeed * 1.0));
    const baseSentiment = -25 + (companySeed * 35);
    const baseRisk = 60 + (context.baseRisk * 20) + region.riskModifier;
    
    return {
      region: region.region,
      sentiment: Math.round(Math.max(-100, Math.min(100, baseSentiment + (regionSeed - 0.5) * 20))), // Round to whole number
      volume: Math.max(0, volume),
      risk: Math.max(0, Math.min(100, Math.floor(baseRisk + (regionSeed - 0.5) * 25))),
      lat: 0, // Placeholder coordinates
      lng: 0
    };
  });
};

export const getMockCompetitorData = (companyName: string = 'GlobalTech Industries'): CompetitorData[] => {
  const context = getCompanyContext(companyName);
  const companySeed = generateCompanySpecificSeed(companyName);
  
  // Generate industry-appropriate competitor names
  const getCompetitorNames = (industry: string) => {
    const bases = {
      technology: ['TechCorp', 'InnovateInc', 'DigitalDyne', 'CloudTech'],
      financial: ['CapitalOne Bank', 'Global Finance', 'Premier Capital', 'Apex Financial'],
      healthcare: ['MedTech Solutions', 'HealthCorp', 'BioInnovate', 'Pharma Global'],
      energy: ['Energy Solutions', 'PowerCorp', 'Global Energy', 'Renewable Tech'],
      retail: ['RetailMax', 'Consumer Choice', 'Market Leaders', 'Retail Solutions'],
      automotive: ['AutoTech', 'Motor Innovations', 'Drive Solutions', 'Automotive Corp']
    };
    return bases[industry] || bases.technology;
  };
  
  const competitorNames = getCompetitorNames(context.industry);
  
  return competitorNames.map((name, index) => {
    const competitorSeed = (companySeed + index * 0.25) % 1;
    const marketShare = Math.max(5, Math.min(40, Math.floor(15 + competitorSeed * 25)));
    const sentiment = Math.round(Math.max(-100, Math.min(100, -10 + competitorSeed * 35))); // Round to whole number
    const trend = Math.round(Math.max(-100, Math.min(100, (competitorSeed - 0.5) * 20))); // Round to whole number
    
    // Calculate competitive advantage relative to our company
    const ourSentiment = -25 + (companySeed * 35);
    const advantage = Math.round(Math.max(-100, Math.min(100, sentiment - ourSentiment))); // Round to whole number
    
    return {
      name: name,
      sentiment: sentiment,
      marketShare: marketShare,
      trend: trend,
      advantage: advantage
    };
  });
};

// UPDATED: Now uses Crisis Validation Service for real data validation
export const getMockCrisisEvents = async (companyName: string = 'GlobalTech Industries'): Promise<CrisisEvent[]> => {
  try {
    // First try to get validated crisis events from real data sources
    const validationResult = await crisisValidationService.validateCompanyCrises(companyName);
    
    if (validationResult.isValid && validationResult.verifiedEvents.length > 0) {
      // Convert validated events to dashboard format
      return validationResult.verifiedEvents.map(event => ({
        date: event.date,
        title: event.title,
        type: event.type,
        impact: event.impact,
        description: event.description
      }));
    }
  } catch (error) {
    console.warn('Crisis validation failed, falling back to generated events:', error);
  }

  // Fallback to generated events if validation fails or no real events found
  return generateFallbackCrisisEvents(companyName);
};

// FIXED: Company-specific crisis events with proper timing
const generateFallbackCrisisEvents = (companyName: string): CrisisEvent[] => {
  const context = getCompanyContext(companyName);
  const companySeed = generateCompanySpecificSeed(companyName);
  
  // Industry-specific crisis scenarios
  const getCrisisScenarios = (industry: string) => {
    const scenarios = {
      technology: [
        { title: 'Data Security Incident', type: 'crisis' as const, impact: -85 },
        { title: 'Product Recall Announcement', type: 'crisis' as const, impact: -45 },
        { title: 'AI Ethics Investigation', type: 'external' as const, impact: -35 }
      ],
      financial: [
        { title: 'Regulatory Compliance Violation', type: 'crisis' as const, impact: -90 },
        { title: 'Trading Algorithm Malfunction', type: 'crisis' as const, impact: -65 },
        { title: 'Federal Reserve Investigation', type: 'external' as const, impact: -40 }
      ],
      healthcare: [
        { title: 'Clinical Trial Safety Concerns', type: 'crisis' as const, impact: -80 },
        { title: 'FDA Warning Letter', type: 'external' as const, impact: -50 },
        { title: 'Patient Data Breach', type: 'crisis' as const, impact: -70 }
      ],
      energy: [
        { title: 'Environmental Incident', type: 'crisis' as const, impact: -95 },
        { title: 'Safety Protocol Violation', type: 'crisis' as const, impact: -60 },
        { title: 'EPA Investigation', type: 'external' as const, impact: -45 }
      ],
      retail: [
        { title: 'Supply Chain Disruption', type: 'crisis' as const, impact: -55 },
        { title: 'Customer Data Breach', type: 'crisis' as const, impact: -70 },
        { title: 'Product Safety Recall', type: 'crisis' as const, impact: -40 }
      ],
      automotive: [
        { title: 'Vehicle Safety Defect', type: 'crisis' as const, impact: -75 },
        { title: 'Manufacturing Quality Issues', type: 'crisis' as const, impact: -50 },
        { title: 'NHTSA Investigation', type: 'external' as const, impact: -35 }
      ]
    };
    return scenarios[industry] || scenarios.technology;
  };
  
  const crisisScenarios = getCrisisScenarios(context.industry);
  
  // FIXED: Use company-specific crisis timing
  const crisisStartDay = getCompanyCrisisDay(companyName);
  
  const events: CrisisEvent[] = [];
  const startDate = new Date('2025-01-01T00:00:00Z'); // Use 2025 start date
  
  // Initial crisis event
  events.push({
    date: addDays(startDate, crisisStartDay),
    title: `${companyName} ${crisisScenarios[0].title}`,
    type: crisisScenarios[0].type,
    impact: crisisScenarios[0].impact,
    description: `Major ${context.industry} sector incident affecting ${companyName} operations`
  });
  
  // CEO/Executive response
  events.push({
    date: addDays(startDate, crisisStartDay + 2),
    title: `${companyName} Executive Leadership Response`,
    type: 'response',
    impact: Math.round(Math.max(-100, Math.min(100, 15 + companySeed * 20))), // Round to whole number
    description: `${companyName} leadership announces comprehensive action plan and accountability measures`
  });
  
  // Regulatory/External response
  if (crisisScenarios[2]) {
    events.push({
      date: addDays(startDate, crisisStartDay + 8),
      title: `${companyName} ${crisisScenarios[2].title}`,
      type: crisisScenarios[2].type,
      impact: crisisScenarios[2].impact,
      description: `Government agency announces formal investigation into ${companyName} practices`
    });
  }
  
  // Corrective measures
  events.push({
    date: addDays(startDate, crisisStartDay + 15),
    title: `${companyName} Comprehensive Reform Package`,
    type: 'announcement',
    impact: Math.round(Math.max(-100, Math.min(100, 25 + companySeed * 15))), // Round to whole number
    description: `${companyName} implements multi-phase corrective action plan with third-party oversight`
  });
  
  // Third-party validation
  events.push({
    date: addDays(startDate, crisisStartDay + 30),
    title: `${companyName} Independent Audit Results`,
    type: 'external',
    impact: Math.round(Math.max(-100, Math.min(100, 18 + companySeed * 12))), // Round to whole number
    description: `Third-party audit confirms ${companyName} implementation of corrective measures`
  });
  
  // Industry recognition (if recovery is going well)
  if (companySeed > 0.4) {
    events.push({
      date: addDays(startDate, crisisStartDay + 50),
      title: `${companyName} Industry Leadership Recognition`,
      type: 'external',
      impact: Math.round(Math.max(-100, Math.min(100, 20 + companySeed * 15))), // Round to whole number
      description: `Industry association recognizes ${companyName} transparency and accountability efforts`
    });
  }
  
  return events;
};

// COMPLETELY REWRITTEN: Now uses Validator Agent for 100% company-specific content
export const getMockThreatsOpportunities = (companyName: string = 'GlobalTech Industries'): ThreatOpportunity[] => {
  // Use the Validator Agent to generate validated, company-specific threats and opportunities
  const validatedItems = validatorAgent.generateValidatedThreatsOpportunities(companyName, 6);
  
  // Convert to the expected format
  return validatedItems.map(item => ({
    id: item.id,
    type: item.type,
    title: item.title,
    description: item.description,
    priority: item.priority,
    probability: item.probability,
    impact: item.impact,
    timeWindow: item.timeWindow,
    verifiedUrl: item.verifiedUrl,
    source: item.source,
    publishedAt: item.publishedAt
  }));
};

export const generateCompanyMetrics = async (companyName: string): Promise<CompanyMetrics | null> => {
  // First validate the company name
  const nameValidation = validateCompanyName(companyName);
  if (!nameValidation.isValid) {
    return null;
  }

  try {
    // Generate all metrics with current date range (from Jan 1, 2025 to today)
    const today = new Date();
    const startDate = new Date('2025-01-01T00:00:00Z');
    const daysSinceStart = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const sentimentData = generateSentimentTimeSeries(daysSinceStart, companyName);
    const hourlyData = generateHourlyData(companyName);
    const kpiMetrics = getMockKPIs(companyName);
    const platformMetrics = getMockPlatformMetrics(companyName);
    const stakeholderSegments = getMockStakeholderSegments(companyName);
    const geographicData = getMockGeographicData(companyName);
    const competitorData = getMockCompetitorData(companyName);
    
    // UPDATED: Use validated crisis events (async)
    const crisisEvents = await getMockCrisisEvents(companyName);
    const threatsOpportunities = getMockThreatsOpportunities(companyName);

    const companyMetrics: CompanyMetrics = {
      sentimentData,
      hourlyData,
      kpiMetrics,
      platformMetrics,
      stakeholderSegments,
      geographicData,
      competitorData,
      crisisEvents,
      threatsOpportunities,
      validation: { isValid: true, errors: [], warnings: [] }
    };

    // Validate the complete metrics
    const validation = validateCompanyMetrics(companyMetrics);
    companyMetrics.validation = validation;

    return validation.isValid ? companyMetrics : null;
  } catch (error) {
    console.error('Error generating company metrics:', error);
    return null;
  }
};