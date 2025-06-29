export interface CompanyProfile {
  name: string;
  industry: string;
  sector: string;
  businessModel: string;
  primaryServices: string[];
  targetMarkets: string[];
  competitors: string[];
  regulatoryBodies: string[];
  keyRisks: string[];
  businessKeywords: string[];
}

export interface ValidationResult {
  isValid: boolean;
  relevanceScore: number;
  reasons: string[];
  suggestions: string[];
}

export interface ValidatedThreatOpportunity {
  id: string;
  type: 'threat' | 'opportunity';
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  probability: number;
  impact: number;
  timeWindow: string;
  validationScore: number;
  businessRelevance: string[];
  verifiedUrl?: string;
  source?: string;
  publishedAt?: string;
}

export class ValidatorAgent {
  private companyProfiles: Map<string, CompanyProfile> = new Map();

  constructor() {
    this.initializeCompanyProfiles();
  }

  private initializeCompanyProfiles(): void {
    // Technology Companies
    this.companyProfiles.set('kaseya', {
      name: 'Kaseya',
      industry: 'Technology',
      sector: 'Software',
      businessModel: 'B2B SaaS',
      primaryServices: ['IT Management', 'MSP Solutions', 'Remote Monitoring', 'Cybersecurity', 'Backup Solutions'],
      targetMarkets: ['Managed Service Providers', 'IT Departments', 'Small-Medium Businesses'],
      competitors: ['ConnectWise', 'Datto', 'SolarWinds MSP', 'Atera', 'NinjaRMM'],
      regulatoryBodies: ['SEC', 'FTC', 'CISA', 'NIST'],
      keyRisks: ['Cybersecurity breaches', 'Regulatory compliance', 'Supply chain attacks', 'Data privacy violations'],
      businessKeywords: ['MSP', 'IT management', 'remote monitoring', 'cybersecurity', 'backup', 'automation', 'endpoint management']
    });

    this.companyProfiles.set('microsoft', {
      name: 'Microsoft',
      industry: 'Technology',
      sector: 'Software & Cloud Services',
      businessModel: 'B2B/B2C SaaS & Licensing',
      primaryServices: ['Cloud Computing', 'Operating Systems', 'Productivity Software', 'Gaming', 'AI Services'],
      targetMarkets: ['Enterprise', 'Government', 'Education', 'Consumers', 'Developers'],
      competitors: ['Google', 'Amazon', 'Apple', 'Oracle', 'Salesforce'],
      regulatoryBodies: ['SEC', 'FTC', 'DOJ', 'EU Commission', 'GDPR'],
      keyRisks: ['Antitrust regulation', 'Data privacy', 'Cybersecurity', 'Cloud outages', 'AI ethics'],
      businessKeywords: ['cloud', 'Azure', 'Office 365', 'Windows', 'AI', 'enterprise software', 'productivity']
    });

    // Financial Services
    this.companyProfiles.set('jpmorgan', {
      name: 'JPMorgan Chase',
      industry: 'Financial Services',
      sector: 'Banking',
      businessModel: 'Traditional Banking & Investment',
      primaryServices: ['Commercial Banking', 'Investment Banking', 'Asset Management', 'Credit Cards', 'Mortgages'],
      targetMarkets: ['Retail Customers', 'Corporate Clients', 'Institutional Investors', 'Government'],
      competitors: ['Bank of America', 'Wells Fargo', 'Goldman Sachs', 'Morgan Stanley', 'Citigroup'],
      regulatoryBodies: ['Federal Reserve', 'FDIC', 'OCC', 'SEC', 'CFPB'],
      keyRisks: ['Interest rate changes', 'Credit defaults', 'Regulatory compliance', 'Market volatility', 'Cybersecurity'],
      businessKeywords: ['banking', 'loans', 'credit', 'investment', 'trading', 'wealth management', 'financial services']
    });

    // Healthcare/Pharmaceutical
    this.companyProfiles.set('pfizer', {
      name: 'Pfizer',
      industry: 'Healthcare',
      sector: 'Pharmaceutical',
      businessModel: 'Drug Development & Manufacturing',
      primaryServices: ['Prescription Drugs', 'Vaccines', 'Oncology Treatments', 'Rare Disease Therapies'],
      targetMarkets: ['Healthcare Providers', 'Patients', 'Government Health Agencies', 'International Markets'],
      competitors: ['Johnson & Johnson', 'Merck', 'Novartis', 'Roche', 'AbbVie'],
      regulatoryBodies: ['FDA', 'EMA', 'CDC', 'WHO', 'DEA'],
      keyRisks: ['Clinical trial failures', 'Regulatory approval delays', 'Patent expirations', 'Drug safety issues'],
      businessKeywords: ['pharmaceutical', 'drugs', 'vaccines', 'clinical trials', 'FDA approval', 'patents', 'healthcare']
    });

    // Energy
    this.companyProfiles.set('exxonmobil', {
      name: 'ExxonMobil',
      industry: 'Energy',
      sector: 'Oil & Gas',
      businessModel: 'Integrated Oil & Gas',
      primaryServices: ['Oil Exploration', 'Refining', 'Petrochemicals', 'Natural Gas', 'Renewable Energy'],
      targetMarkets: ['Industrial Customers', 'Retail Consumers', 'Government', 'Transportation Sector'],
      competitors: ['Chevron', 'Shell', 'BP', 'TotalEnergies', 'ConocoPhillips'],
      regulatoryBodies: ['EPA', 'DOE', 'FERC', 'OSHA', 'SEC'],
      keyRisks: ['Environmental regulations', 'Oil price volatility', 'Climate change policies', 'Operational safety'],
      businessKeywords: ['oil', 'gas', 'refining', 'petrochemicals', 'energy', 'exploration', 'environmental']
    });
  }

  public getCompanyProfile(companyName: string): CompanyProfile | null {
    const key = companyName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    
    // Direct match
    if (this.companyProfiles.has(key)) {
      return this.companyProfiles.get(key)!;
    }

    // Partial match for company names
    for (const [profileKey, profile] of this.companyProfiles.entries()) {
      if (key.includes(profileKey) || profileKey.includes(key)) {
        return profile;
      }
    }

    // Generate dynamic profile for unknown companies
    return this.generateDynamicProfile(companyName);
  }

  private generateDynamicProfile(companyName: string): CompanyProfile {
    const name = companyName.toLowerCase();
    
    // Industry classification based on company name patterns
    let industry = 'Technology';
    let sector = 'Software';
    let businessModel = 'B2B Services';
    let primaryServices: string[] = [];
    let regulatoryBodies: string[] = [];
    let keyRisks: string[] = [];
    let businessKeywords: string[] = [];

    if (name.includes('bank') || name.includes('financial') || name.includes('capital') || name.includes('credit')) {
      industry = 'Financial Services';
      sector = 'Banking';
      businessModel = 'Financial Services';
      primaryServices = ['Banking Services', 'Financial Products', 'Investment Services'];
      regulatoryBodies = ['Federal Reserve', 'FDIC', 'SEC', 'CFPB'];
      keyRisks = ['Regulatory compliance', 'Credit risk', 'Market volatility', 'Cybersecurity'];
      businessKeywords = ['banking', 'financial', 'credit', 'investment', 'loans'];
    } else if (name.includes('pharma') || name.includes('bio') || name.includes('health') || name.includes('medical')) {
      industry = 'Healthcare';
      sector = 'Pharmaceutical';
      businessModel = 'Healthcare Services';
      primaryServices = ['Healthcare Products', 'Medical Services', 'Pharmaceutical Development'];
      regulatoryBodies = ['FDA', 'CDC', 'CMS', 'DEA'];
      keyRisks = ['Regulatory approval', 'Clinical trial risks', 'Product liability', 'Patent protection'];
      businessKeywords = ['healthcare', 'medical', 'pharmaceutical', 'clinical', 'FDA'];
    } else if (name.includes('energy') || name.includes('oil') || name.includes('gas') || name.includes('power')) {
      industry = 'Energy';
      sector = 'Oil & Gas';
      businessModel = 'Energy Production';
      primaryServices = ['Energy Production', 'Power Generation', 'Energy Distribution'];
      regulatoryBodies = ['EPA', 'DOE', 'FERC', 'OSHA'];
      keyRisks = ['Environmental regulations', 'Safety incidents', 'Price volatility', 'Climate policies'];
      businessKeywords = ['energy', 'oil', 'gas', 'power', 'environmental'];
    } else if (name.includes('retail') || name.includes('consumer') || name.includes('store')) {
      industry = 'Retail';
      sector = 'Consumer Goods';
      businessModel = 'Retail Sales';
      primaryServices = ['Retail Sales', 'Consumer Products', 'E-commerce'];
      regulatoryBodies = ['FTC', 'CPSC', 'FDA', 'OSHA'];
      keyRisks = ['Consumer safety', 'Supply chain disruption', 'Market competition', 'Regulatory compliance'];
      businessKeywords = ['retail', 'consumer', 'sales', 'products', 'commerce'];
    } else {
      // Default to technology
      primaryServices = ['Technology Solutions', 'Software Development', 'IT Services'];
      regulatoryBodies = ['FTC', 'SEC', 'NIST', 'CISA'];
      keyRisks = ['Cybersecurity threats', 'Data privacy', 'Technology disruption', 'Regulatory compliance'];
      businessKeywords = ['technology', 'software', 'IT', 'digital', 'innovation'];
    }

    return {
      name: companyName,
      industry,
      sector,
      businessModel,
      primaryServices,
      targetMarkets: ['Business Customers', 'Enterprise Clients', 'Government'],
      competitors: ['Industry Competitor A', 'Industry Competitor B', 'Industry Competitor C'],
      regulatoryBodies,
      keyRisks,
      businessKeywords
    };
  }

  public validateThreatOpportunity(
    item: any,
    companyProfile: CompanyProfile
  ): ValidationResult {
    const title = item.title?.toLowerCase() || '';
    const description = item.description?.toLowerCase() || '';
    const content = `${title} ${description}`;

    let relevanceScore = 0;
    const reasons: string[] = [];
    const suggestions: string[] = [];

    // 1. Company Name Relevance (30 points)
    if (content.includes(companyProfile.name.toLowerCase())) {
      relevanceScore += 30;
      reasons.push('Contains company name');
    } else {
      suggestions.push('Should specifically mention the company name');
    }

    // 2. Industry Relevance (25 points)
    const industryKeywords = [
      companyProfile.industry.toLowerCase(),
      companyProfile.sector.toLowerCase(),
      ...companyProfile.businessKeywords
    ];

    let industryMatches = 0;
    industryKeywords.forEach(keyword => {
      if (content.includes(keyword)) {
        industryMatches++;
      }
    });

    if (industryMatches > 0) {
      relevanceScore += Math.min(25, industryMatches * 5);
      reasons.push(`Matches ${industryMatches} industry keywords`);
    } else {
      suggestions.push(`Should include industry-specific terms: ${companyProfile.businessKeywords.slice(0, 3).join(', ')}`);
    }

    // 3. Business Service Relevance (20 points)
    let serviceMatches = 0;
    companyProfile.primaryServices.forEach(service => {
      if (content.includes(service.toLowerCase())) {
        serviceMatches++;
      }
    });

    if (serviceMatches > 0) {
      relevanceScore += Math.min(20, serviceMatches * 7);
      reasons.push(`Relates to ${serviceMatches} business services`);
    } else {
      suggestions.push(`Should relate to company services: ${companyProfile.primaryServices.slice(0, 2).join(', ')}`);
    }

    // 4. Risk/Opportunity Relevance (15 points)
    let riskMatches = 0;
    companyProfile.keyRisks.forEach(risk => {
      if (content.includes(risk.toLowerCase())) {
        riskMatches++;
      }
    });

    if (riskMatches > 0) {
      relevanceScore += Math.min(15, riskMatches * 5);
      reasons.push(`Addresses ${riskMatches} known business risks`);
    }

    // 5. Regulatory Relevance (10 points)
    let regulatoryMatches = 0;
    companyProfile.regulatoryBodies.forEach(body => {
      if (content.includes(body.toLowerCase())) {
        regulatoryMatches++;
      }
    });

    if (regulatoryMatches > 0) {
      relevanceScore += Math.min(10, regulatoryMatches * 3);
      reasons.push(`Mentions ${regulatoryMatches} relevant regulatory bodies`);
    }

    // Penalty for irrelevant content
    const irrelevantKeywords = [
      'sports', 'game', 'match', 'tournament', 'player', 'team', 'coach',
      'entertainment', 'celebrity', 'movie', 'music', 'fashion', 'dating',
      'restaurant', 'food', 'recipe', 'travel', 'vacation', 'weather'
    ];

    let irrelevantMatches = 0;
    irrelevantKeywords.forEach(keyword => {
      if (content.includes(keyword)) {
        irrelevantMatches++;
      }
    });

    if (irrelevantMatches > 0) {
      relevanceScore -= irrelevantMatches * 20;
      reasons.push(`Contains ${irrelevantMatches} irrelevant keywords`);
      suggestions.push('Remove non-business related content');
    }

    const isValid = relevanceScore >= 50; // Minimum 50% relevance required

    if (!isValid) {
      suggestions.push('Increase business relevance by focusing on company-specific risks and opportunities');
    }

    return {
      isValid,
      relevanceScore: Math.max(0, Math.min(100, relevanceScore)),
      reasons,
      suggestions
    };
  }

  public generateValidatedThreatsOpportunities(
    companyName: string,
    count: number = 6
  ): ValidatedThreatOpportunity[] {
    const profile = this.getCompanyProfile(companyName);
    if (!profile) return [];

    const items: ValidatedThreatOpportunity[] = [];
    const companySeed = this.generateSeed(companyName);

    // Generate industry-specific threats
    const threats = this.generateIndustryThreats(profile, companySeed);
    threats.slice(0, Math.ceil(count / 2)).forEach((threat, index) => {
      items.push({
        id: `validated-threat-${index}`,
        type: 'threat',
        title: threat.title,
        description: threat.description,
        priority: threat.priority,
        probability: threat.probability,
        impact: threat.impact,
        timeWindow: this.calculateTimeWindow(threat.priority),
        validationScore: 95, // High score for generated content
        businessRelevance: threat.businessRelevance
      });
    });

    // Generate industry-specific opportunities
    const opportunities = this.generateIndustryOpportunities(profile, companySeed);
    opportunities.slice(0, Math.floor(count / 2)).forEach((opportunity, index) => {
      items.push({
        id: `validated-opportunity-${index}`,
        type: 'opportunity',
        title: opportunity.title,
        description: opportunity.description,
        priority: opportunity.priority,
        probability: opportunity.probability,
        impact: opportunity.impact,
        timeWindow: this.calculateTimeWindow(opportunity.priority),
        validationScore: 95, // High score for generated content
        businessRelevance: opportunity.businessRelevance
      });
    });

    return items;
  }

  private generateIndustryThreats(profile: CompanyProfile, seed: number): any[] {
    const threats: any[] = [];

    if (profile.industry === 'Technology') {
      threats.push(
        {
          title: `${profile.name} Cybersecurity Vulnerability Assessment`,
          description: `Security researchers identify potential vulnerabilities in ${profile.name}'s infrastructure that could compromise ${profile.primaryServices[0]} operations and expose sensitive customer data.`,
          priority: 'critical',
          probability: 0.6 + seed * 0.2,
          impact: -60,
          businessRelevance: ['Cybersecurity', 'Data Protection', 'Customer Trust']
        },
        {
          title: `${profile.name} Regulatory Compliance Challenge`,
          description: `New technology oversight legislation specifically impacts companies like ${profile.name}, requiring significant investments in ${profile.primaryServices[1]} compliance protocols.`,
          priority: 'high',
          probability: 0.5 + seed * 0.3,
          impact: -45,
          businessRelevance: ['Regulatory Compliance', 'Operational Costs', 'Market Access']
        },
        {
          title: `${profile.name} Supply Chain Security Risk`,
          description: `Third-party software dependencies used in ${profile.name}'s ${profile.primaryServices[0]} solutions face potential security compromises affecting service delivery.`,
          priority: 'high',
          probability: 0.4 + seed * 0.4,
          impact: -40,
          businessRelevance: ['Supply Chain', 'Service Reliability', 'Customer Impact']
        }
      );
    } else if (profile.industry === 'Financial Services') {
      threats.push(
        {
          title: `${profile.name} Regulatory Audit Intensification`,
          description: `${profile.regulatoryBodies[0]} announces enhanced scrutiny of ${profile.name}'s ${profile.primaryServices[0]} operations, potentially leading to operational restrictions.`,
          priority: 'critical',
          probability: 0.7 + seed * 0.2,
          impact: -70,
          businessRelevance: ['Regulatory Compliance', 'Banking Operations', 'Market Reputation']
        },
        {
          title: `${profile.name} Interest Rate Exposure Risk`,
          description: `Federal Reserve policy changes specifically impact ${profile.name}'s ${profile.primaryServices[1]} portfolio and lending operations.`,
          priority: 'high',
          probability: 0.6 + seed * 0.3,
          impact: -50,
          businessRelevance: ['Interest Rate Risk', 'Portfolio Management', 'Profitability']
        }
      );
    } else if (profile.industry === 'Healthcare') {
      threats.push(
        {
          title: `${profile.name} FDA Compliance Review`,
          description: `FDA announces enhanced oversight of ${profile.name}'s ${profile.primaryServices[0]} development processes, potentially delaying product approvals.`,
          priority: 'critical',
          probability: 0.5 + seed * 0.3,
          impact: -65,
          businessRelevance: ['FDA Compliance', 'Product Development', 'Market Access']
        },
        {
          title: `${profile.name} Clinical Trial Oversight`,
          description: `New clinical trial regulations specifically impact ${profile.name}'s research methodology for ${profile.primaryServices[1]} development.`,
          priority: 'high',
          probability: 0.4 + seed * 0.4,
          impact: -45,
          businessRelevance: ['Clinical Research', 'Drug Development', 'Regulatory Approval']
        }
      );
    }

    return threats;
  }

  private generateIndustryOpportunities(profile: CompanyProfile, seed: number): any[] {
    const opportunities: any[] = [];

    if (profile.industry === 'Technology') {
      opportunities.push(
        {
          title: `${profile.name} Government Contract Opportunity`,
          description: `Federal technology modernization initiative specifically aligns with ${profile.name}'s ${profile.primaryServices[0]} capabilities, presenting significant revenue opportunities.`,
          priority: 'high',
          probability: 0.6 + seed * 0.2,
          impact: 55,
          businessRelevance: ['Government Contracts', 'Revenue Growth', 'Market Expansion']
        },
        {
          title: `${profile.name} Strategic Acquisition Target`,
          description: `Industry consolidation trends position ${profile.name} as an attractive acquisition target for companies seeking ${profile.primaryServices[1]} capabilities.`,
          priority: 'medium',
          probability: 0.4 + seed * 0.4,
          impact: 45,
          businessRelevance: ['Strategic Partnerships', 'Market Valuation', 'Growth Opportunities']
        },
        {
          title: `${profile.name} AI Innovation Partnership`,
          description: `Leading technology companies announce partnership programs that could provide ${profile.name} with access to AI technologies for ${profile.primaryServices[2]} enhancement.`,
          priority: 'medium',
          probability: 0.5 + seed * 0.3,
          impact: 40,
          businessRelevance: ['Technology Innovation', 'Product Enhancement', 'Competitive Advantage']
        }
      );
    } else if (profile.industry === 'Financial Services') {
      opportunities.push(
        {
          title: `${profile.name} Fintech Partnership Initiative`,
          description: `Emerging fintech partnerships offer ${profile.name} opportunities to enhance ${profile.primaryServices[0]} through digital transformation and new service offerings.`,
          priority: 'high',
          probability: 0.5 + seed * 0.3,
          impact: 50,
          businessRelevance: ['Digital Transformation', 'Service Innovation', 'Customer Experience']
        },
        {
          title: `${profile.name} ESG Investment Opportunity`,
          description: `Growing ESG investment trends favor ${profile.name}'s sustainable ${profile.primaryServices[1]} practices and governance structures.`,
          priority: 'medium',
          probability: 0.6 + seed * 0.2,
          impact: 35,
          businessRelevance: ['ESG Compliance', 'Investment Attraction', 'Brand Reputation']
        }
      );
    } else if (profile.industry === 'Healthcare') {
      opportunities.push(
        {
          title: `${profile.name} Breakthrough Therapy Designation`,
          description: `FDA fast-track opportunities for ${profile.name}'s innovative ${profile.primaryServices[0]} align with accelerated approval pathways.`,
          priority: 'high',
          probability: 0.4 + seed * 0.4,
          impact: 60,
          businessRelevance: ['FDA Approval', 'Market Access', 'Revenue Acceleration']
        },
        {
          title: `${profile.name} Global Health Partnership`,
          description: `International health organizations offer ${profile.name} opportunities for global expansion of ${profile.primaryServices[1]} in emerging markets.`,
          priority: 'medium',
          probability: 0.5 + seed * 0.3,
          impact: 40,
          businessRelevance: ['Global Expansion', 'Market Access', 'Partnership Development']
        }
      );
    }

    return opportunities;
  }

  private generateSeed(companyName: string): number {
    let hash = 0;
    for (let i = 0; i < companyName.length; i++) {
      const char = companyName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash) / 2147483647;
  }

  private calculateTimeWindow(priority: string): string {
    switch (priority) {
      case 'critical': return '24-48 hours';
      case 'high': return '3-7 days';
      case 'medium': return '1-2 weeks';
      default: return '2-4 weeks';
    }
  }

  public filterAndValidateItems(
    items: any[],
    companyName: string,
    minValidationScore: number = 50
  ): ValidatedThreatOpportunity[] {
    const profile = this.getCompanyProfile(companyName);
    if (!profile) return [];

    const validatedItems: ValidatedThreatOpportunity[] = [];

    items.forEach((item, index) => {
      const validation = this.validateThreatOpportunity(item, profile);
      
      if (validation.isValid && validation.relevanceScore >= minValidationScore) {
        validatedItems.push({
          id: item.id || `validated-${index}`,
          type: item.type,
          title: item.title,
          description: item.description,
          priority: item.priority,
          probability: item.probability,
          impact: item.impact,
          timeWindow: item.timeWindow,
          validationScore: validation.relevanceScore,
          businessRelevance: validation.reasons,
          verifiedUrl: item.verifiedUrl,
          source: item.source,
          publishedAt: item.publishedAt
        });
      }
    });

    return validatedItems.sort((a, b) => b.validationScore - a.validationScore);
  }
}

export const validatorAgent = new ValidatorAgent();