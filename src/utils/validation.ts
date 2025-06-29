import type { 
  CompanyMetrics, 
  ValidationResult, 
  KPIMetrics, 
  PlatformMetrics, 
  StakeholderSegment,
  GeographicData,
  CompetitorData,
  CrisisEvent,
  ThreatOpportunity,
  SentimentData
} from '../types/dashboard';

export const validateCompanyName = (companyName: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!companyName || companyName.trim().length === 0) {
    errors.push('Company name is required');
  }

  if (companyName.trim().length < 2) {
    errors.push('Company name must be at least 2 characters');
  }

  if (companyName.trim().length > 100) {
    errors.push('Company name must be less than 100 characters');
  }

  // Check for potentially problematic characters
  const invalidChars = /[<>{}[\]\\\/]/;
  if (invalidChars.test(companyName)) {
    errors.push('Company name contains invalid characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateKPIMetrics = (metrics: KPIMetrics): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate sentiment score range
  if (metrics.overallSentiment < -100 || metrics.overallSentiment > 100) {
    errors.push('Overall sentiment must be between -100 and 100');
  }

  // Validate percentage-based metrics
  if (metrics.recoveryVelocity < 0 || metrics.recoveryVelocity > 100) {
    errors.push('Recovery velocity must be between 0 and 100');
  }

  if (metrics.stakeholderConfidence < 0 || metrics.stakeholderConfidence > 100) {
    errors.push('Stakeholder confidence must be between 0 and 100');
  }

  if (metrics.mediaMomentum < 0 || metrics.mediaMomentum > 100) {
    errors.push('Media momentum must be between 0 and 100');
  }

  // Validate competitive advantage (can be negative)
  if (metrics.competitiveAdvantage < -100 || metrics.competitiveAdvantage > 100) {
    errors.push('Competitive advantage must be between -100 and 100');
  }

  // Warnings for extreme values
  if (metrics.overallSentiment < -80) {
    warnings.push('Extremely negative sentiment detected');
  }

  if (metrics.recoveryVelocity < 10) {
    warnings.push('Very low recovery velocity');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validatePlatformMetrics = (platforms: PlatformMetrics[]): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!platforms || platforms.length === 0) {
    errors.push('Platform metrics are required');
    return { isValid: false, errors, warnings };
  }

  platforms.forEach((platform, index) => {
    if (!platform.platform || platform.platform.trim().length === 0) {
      errors.push(`Platform ${index + 1}: Platform name is required`);
    }

    if (platform.sentiment < -100 || platform.sentiment > 100) {
      errors.push(`Platform ${platform.platform}: Sentiment must be between -100 and 100`);
    }

    if (platform.volume < 0) {
      errors.push(`Platform ${platform.platform}: Volume cannot be negative`);
    }

    if (platform.engagement < 0 || platform.engagement > 100) {
      errors.push(`Platform ${platform.platform}: Engagement must be between 0 and 100`);
    }

    if (platform.reach < 0) {
      errors.push(`Platform ${platform.platform}: Reach cannot be negative`);
    }

    if (platform.confidence < 0 || platform.confidence > 1) {
      errors.push(`Platform ${platform.platform}: Confidence must be between 0 and 1`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateStakeholderSegments = (segments: StakeholderSegment[]): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!segments || segments.length === 0) {
    errors.push('Stakeholder segments are required');
    return { isValid: false, errors, warnings };
  }

  const validPriorities = ['critical', 'high', 'medium', 'low'];

  segments.forEach((segment, index) => {
    if (!segment.segment || segment.segment.trim().length === 0) {
      errors.push(`Segment ${index + 1}: Segment name is required`);
    }

    if (segment.sentiment < -100 || segment.sentiment > 100) {
      errors.push(`Segment ${segment.segment}: Sentiment must be between -100 and 100`);
    }

    if (segment.volume < 0) {
      errors.push(`Segment ${segment.segment}: Volume cannot be negative`);
    }

    if (segment.trend < -100 || segment.trend > 100) {
      errors.push(`Segment ${segment.segment}: Trend must be between -100 and 100`);
    }

    if (!validPriorities.includes(segment.priority)) {
      errors.push(`Segment ${segment.segment}: Invalid priority level`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateGeographicData = (regions: GeographicData[]): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!regions || regions.length === 0) {
    errors.push('Geographic data is required');
    return { isValid: false, errors, warnings };
  }

  regions.forEach((region, index) => {
    if (!region.region || region.region.trim().length === 0) {
      errors.push(`Region ${index + 1}: Region name is required`);
    }

    if (region.sentiment < -100 || region.sentiment > 100) {
      errors.push(`Region ${region.region}: Sentiment must be between -100 and 100`);
    }

    if (region.volume < 0) {
      errors.push(`Region ${region.region}: Volume cannot be negative`);
    }

    if (region.risk < 0 || region.risk > 100) {
      errors.push(`Region ${region.region}: Risk must be between 0 and 100`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateCompetitorData = (competitors: CompetitorData[]): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!competitors || competitors.length === 0) {
    errors.push('Competitor data is required');
    return { isValid: false, errors, warnings };
  }

  competitors.forEach((competitor, index) => {
    if (!competitor.name || competitor.name.trim().length === 0) {
      errors.push(`Competitor ${index + 1}: Name is required`);
    }

    if (competitor.sentiment < -100 || competitor.sentiment > 100) {
      errors.push(`Competitor ${competitor.name}: Sentiment must be between -100 and 100`);
    }

    if (competitor.marketShare < 0 || competitor.marketShare > 100) {
      errors.push(`Competitor ${competitor.name}: Market share must be between 0 and 100`);
    }

    if (competitor.trend < -100 || competitor.trend > 100) {
      errors.push(`Competitor ${competitor.name}: Trend must be between -100 and 100`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateSentimentData = (data: SentimentData[]): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data || data.length === 0) {
    errors.push('Sentiment data is required');
    return { isValid: false, errors, warnings };
  }

  // Check for minimum data points
  if (data.length < 30) {
    warnings.push('Limited historical data available');
  }

  data.forEach((point, index) => {
    if (!point.timestamp) {
      errors.push(`Data point ${index + 1}: Timestamp is required`);
    }

    if (point.sentiment < -100 || point.sentiment > 100) {
      errors.push(`Data point ${index + 1}: Sentiment must be between -100 and 100`);
    }

    if (point.volume < 0) {
      errors.push(`Data point ${index + 1}: Volume cannot be negative`);
    }

    if (point.confidence < 0 || point.confidence > 1) {
      errors.push(`Data point ${index + 1}: Confidence must be between 0 and 1`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateThreatsOpportunities = (items: ThreatOpportunity[]): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!items || items.length === 0) {
    warnings.push('No threats or opportunities data available');
    return { isValid: true, errors, warnings };
  }

  const validTypes = ['threat', 'opportunity'];
  const validPriorities = ['critical', 'high', 'medium', 'low'];

  items.forEach((item, index) => {
    if (!item.id || item.id.trim().length === 0) {
      errors.push(`Item ${index + 1}: ID is required`);
    }

    if (!validTypes.includes(item.type)) {
      errors.push(`Item ${item.id}: Invalid type`);
    }

    if (!item.title || item.title.trim().length === 0) {
      errors.push(`Item ${item.id}: Title is required`);
    }

    if (!validPriorities.includes(item.priority)) {
      errors.push(`Item ${item.id}: Invalid priority level`);
    }

    if (item.probability < 0 || item.probability > 1) {
      errors.push(`Item ${item.id}: Probability must be between 0 and 1`);
    }

    if (item.impact < -100 || item.impact > 100) {
      errors.push(`Item ${item.id}: Impact must be between -100 and 100`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateCompanyMetrics = (metrics: CompanyMetrics): ValidationResult => {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  // Validate each component
  const kpiValidation = validateKPIMetrics(metrics.kpiMetrics);
  const platformValidation = validatePlatformMetrics(metrics.platformMetrics);
  const stakeholderValidation = validateStakeholderSegments(metrics.stakeholderSegments);
  const geographicValidation = validateGeographicData(metrics.geographicData);
  const competitorValidation = validateCompetitorData(metrics.competitorData);
  const sentimentValidation = validateSentimentData(metrics.sentimentData);
  const hourlyValidation = validateSentimentData(metrics.hourlyData);
  const threatsValidation = validateThreatsOpportunities(metrics.threatsOpportunities);

  // Collect all errors and warnings
  allErrors.push(...kpiValidation.errors);
  allErrors.push(...platformValidation.errors);
  allErrors.push(...stakeholderValidation.errors);
  allErrors.push(...geographicValidation.errors);
  allErrors.push(...competitorValidation.errors);
  allErrors.push(...sentimentValidation.errors);
  allErrors.push(...hourlyValidation.errors);
  allErrors.push(...threatsValidation.errors);

  allWarnings.push(...kpiValidation.warnings);
  allWarnings.push(...platformValidation.warnings);
  allWarnings.push(...stakeholderValidation.warnings);
  allWarnings.push(...geographicValidation.warnings);
  allWarnings.push(...competitorValidation.warnings);
  allWarnings.push(...sentimentValidation.warnings);
  allWarnings.push(...hourlyValidation.warnings);
  allWarnings.push(...threatsValidation.warnings);

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
};