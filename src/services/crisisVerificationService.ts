import axios from 'axios';
import { crisisValidationService, ValidatedCrisisEvent } from './crisisValidationService';
import { verifiedNewsService } from './verifiedNewsService';

export interface VerificationSource {
  name: string;
  url: string;
  reliability: number;
  verified: boolean;
}

export interface CrisisVerificationResult {
  isVerified: boolean;
  confidence: number;
  sources: VerificationSource[];
  verifiedEvents: ValidatedCrisisEvent[];
  verificationSummary: {
    totalSources: number;
    verifiedSources: number;
    averageReliability: number;
    crossVerificationScore: number;
  };
}

export class CrisisVerificationService {
  private readonly verificationSources = [
    {
      name: 'Reuters',
      baseUrl: 'https://www.reuters.com',
      rssUrl: 'https://feeds.reuters.com/reuters/businessNews',
      reliability: 0.95
    },
    {
      name: 'Associated Press',
      baseUrl: 'https://apnews.com',
      rssUrl: 'https://feeds.apnews.com/rss/apf-business',
      reliability: 0.94
    },
    {
      name: 'BBC Business',
      baseUrl: 'https://www.bbc.com',
      rssUrl: 'https://feeds.bbci.co.uk/news/business/rss.xml',
      reliability: 0.92
    },
    {
      name: 'Financial Times',
      baseUrl: 'https://www.ft.com',
      rssUrl: 'https://www.ft.com/rss/home',
      reliability: 0.93
    },
    {
      name: 'Wall Street Journal',
      baseUrl: 'https://www.wsj.com',
      rssUrl: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml',
      reliability: 0.94
    },
    {
      name: 'Bloomberg',
      baseUrl: 'https://www.bloomberg.com',
      rssUrl: 'https://feeds.bloomberg.com/markets/news.rss',
      reliability: 0.93
    }
  ];

  private readonly corsProxies = [
    'https://api.allorigins.win/get?url=',
    'https://corsproxy.io/?'
  ];

  private readonly minimumSources = 2; // Require at least 2 sources for verification
  private readonly minimumConfidence = 0.7; // 70% confidence threshold

  public async verifyCrisisEvents(companyName: string): Promise<CrisisVerificationResult> {
    try {
      // Step 1: Get initial crisis events from validation service
      const initialValidation = await crisisValidationService.validateCompanyCrises(companyName);
      
      if (!initialValidation.isValid || initialValidation.verifiedEvents.length === 0) {
        return this.createEmptyVerificationResult();
      }

      // Step 2: Cross-verify each event across multiple sources
      const verificationResults = await Promise.all(
        initialValidation.verifiedEvents.map(event => 
          this.crossVerifyEvent(event, companyName)
        )
      );

      // Step 3: Filter events that meet verification criteria
      const verifiedEvents = verificationResults
        .filter(result => result.isVerified && result.confidence >= this.minimumConfidence)
        .map(result => result.event);

      // Step 4: Calculate overall verification metrics
      const allSources = verificationResults.flatMap(result => result.sources);
      const verifiedSources = allSources.filter(source => source.verified);
      
      const verificationSummary = {
        totalSources: allSources.length,
        verifiedSources: verifiedSources.length,
        averageReliability: verifiedSources.length > 0 ? 
          verifiedSources.reduce((sum, source) => sum + source.reliability, 0) / verifiedSources.length : 0,
        crossVerificationScore: verifiedEvents.length > 0 ? 
          verificationResults.reduce((sum, result) => sum + result.confidence, 0) / verificationResults.length : 0
      };

      return {
        isVerified: verifiedEvents.length > 0,
        confidence: verificationSummary.crossVerificationScore,
        sources: this.deduplicateSources(allSources),
        verifiedEvents,
        verificationSummary
      };

    } catch (error) {
      console.error('Crisis verification failed:', error);
      return this.createEmptyVerificationResult();
    }
  }

  private async crossVerifyEvent(
    event: ValidatedCrisisEvent, 
    companyName: string
  ): Promise<{
    event: ValidatedCrisisEvent;
    isVerified: boolean;
    confidence: number;
    sources: VerificationSource[];
  }> {
    const sources: VerificationSource[] = [];
    let verificationCount = 0;
    let totalReliability = 0;

    // Search across multiple verification sources
    for (const source of this.verificationSources) {
      try {
        const isVerified = await this.searchSourceForEvent(source, event, companyName);
        
        sources.push({
          name: source.name,
          url: source.baseUrl,
          reliability: source.reliability,
          verified: isVerified
        });

        if (isVerified) {
          verificationCount++;
          totalReliability += source.reliability;
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.warn(`Verification failed for source ${source.name}:`, error);
        sources.push({
          name: source.name,
          url: source.baseUrl,
          reliability: source.reliability,
          verified: false
        });
      }
    }

    const isVerified = verificationCount >= this.minimumSources;
    const confidence = isVerified ? (totalReliability / verificationCount) : 0;

    return {
      event,
      isVerified,
      confidence,
      sources
    };
  }

  private async searchSourceForEvent(
    source: any,
    event: ValidatedCrisisEvent,
    companyName: string
  ): Promise<boolean> {
    try {
      // Create search query combining company name and event keywords
      const eventKeywords = this.extractEventKeywords(event.title, event.description);
      const searchQuery = `"${companyName}" ${eventKeywords.join(' ')}`;
      
      // Search the source's RSS feed
      for (const proxy of this.corsProxies) {
        try {
          const proxyUrl = `${proxy}${encodeURIComponent(source.rssUrl)}`;
          const response = await axios.get(proxyUrl, {
            timeout: 15000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; CrisisVerifier/1.0)'
            }
          });

          let xmlContent = response.data;
          if (xmlContent.contents) {
            xmlContent = xmlContent.contents;
          }

          if (xmlContent && xmlContent.includes('<item>')) {
            return this.searchXMLForEvent(xmlContent, companyName, eventKeywords, event.date);
          }
        } catch (error) {
          continue; // Try next proxy
        }
      }

      return false;
    } catch (error) {
      console.warn(`Source search failed for ${source.name}:`, error);
      return false;
    }
  }

  private searchXMLForEvent(
    xmlContent: string,
    companyName: string,
    eventKeywords: string[],
    eventDate: Date
  ): boolean {
    try {
      const itemRegex = /<item>(.*?)<\/item>/gs;
      const items = xmlContent.match(itemRegex) || [];
      
      for (const item of items) {
        const title = this.extractXMLContent(item, 'title').toLowerCase();
        const description = this.extractXMLContent(item, 'description').toLowerCase();
        const pubDate = this.extractXMLContent(item, 'pubDate');
        
        const content = `${title} ${description}`;
        
        // Check if article mentions the company
        if (!content.includes(companyName.toLowerCase())) {
          continue;
        }

        // Check if article contains event keywords
        const keywordMatches = eventKeywords.filter(keyword => 
          content.includes(keyword.toLowerCase())
        ).length;

        if (keywordMatches < 2) { // Require at least 2 keyword matches
          continue;
        }

        // Check if article date is within reasonable range of event date
        if (pubDate) {
          const articleDate = new Date(pubDate);
          const daysDifference = Math.abs(
            (articleDate.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (daysDifference <= 30) { // Within 30 days of event
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      console.error('XML search failed:', error);
      return false;
    }
  }

  private extractEventKeywords(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const keywords: string[] = [];

    // Crisis-related keywords
    const crisisKeywords = [
      'investigation', 'lawsuit', 'breach', 'hack', 'scandal', 'crisis',
      'violation', 'fine', 'penalty', 'regulatory', 'compliance',
      'data breach', 'security incident', 'cyberattack', 'ransomware',
      'fraud', 'misconduct', 'settlement', 'charges', 'indictment'
    ];

    // Response keywords
    const responseKeywords = [
      'response', 'statement', 'apology', 'action plan', 'measures',
      'investigation launched', 'cooperation', 'transparency',
      'accountability', 'remediation', 'corrective action'
    ];

    // Extract relevant keywords from the text
    [...crisisKeywords, ...responseKeywords].forEach(keyword => {
      if (text.includes(keyword)) {
        keywords.push(keyword);
      }
    });

    return keywords.slice(0, 5); // Limit to top 5 keywords
  }

  private extractXMLContent(xml: string, tag: string): string {
    const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 'is');
    const match = xml.match(regex);
    return match ? this.cleanText(match[1]) : '';
  }

  private cleanText(text: string): string {
    return text
      .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
      .replace(/<[^>]*>/g, '')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/&/g, '&')
      .replace(/"/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private deduplicateSources(sources: VerificationSource[]): VerificationSource[] {
    const unique = new Map<string, VerificationSource>();
    
    sources.forEach(source => {
      const existing = unique.get(source.name);
      if (!existing || source.verified) {
        unique.set(source.name, source);
      }
    });

    return Array.from(unique.values());
  }

  private createEmptyVerificationResult(): CrisisVerificationResult {
    return {
      isVerified: false,
      confidence: 0,
      sources: [],
      verifiedEvents: [],
      verificationSummary: {
        totalSources: 0,
        verifiedSources: 0,
        averageReliability: 0,
        crossVerificationScore: 0
      }
    };
  }

  public async hasVerifiedCrisisEvents(companyName: string): Promise<boolean> {
    try {
      const verificationResult = await this.verifyCrisisEvents(companyName);
      return verificationResult.isVerified && 
             verificationResult.verifiedEvents.length > 0 &&
             verificationResult.confidence >= this.minimumConfidence;
    } catch (error) {
      console.error('Crisis verification check failed:', error);
      return false;
    }
  }
}

export const crisisVerificationService = new CrisisVerificationService();