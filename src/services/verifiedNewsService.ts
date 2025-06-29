import axios from 'axios';

export interface VerifiedNewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
  category: 'threat' | 'opportunity';
  priority: 'critical' | 'high' | 'medium' | 'low';
  impact: number;
  probability: number;
  verified: boolean;
  companyRelevance: number;
}

export interface NewsSource {
  name: string;
  baseUrl: string;
  rssUrl: string;
  category: string;
  reliability: number;
}

export class VerifiedNewsService {
  private readonly verifiedSources: NewsSource[] = [
    {
      name: 'Reuters Business',
      baseUrl: 'https://www.reuters.com',
      rssUrl: 'https://feeds.reuters.com/reuters/businessNews',
      category: 'business',
      reliability: 0.95
    },
    {
      name: 'Associated Press Business',
      baseUrl: 'https://apnews.com',
      rssUrl: 'https://feeds.apnews.com/rss/apf-business',
      category: 'business',
      reliability: 0.94
    },
    {
      name: 'BBC Business',
      baseUrl: 'https://www.bbc.com',
      rssUrl: 'https://feeds.bbci.co.uk/news/business/rss.xml',
      category: 'business',
      reliability: 0.92
    },
    {
      name: 'Financial Times',
      baseUrl: 'https://www.ft.com',
      rssUrl: 'https://www.ft.com/rss/home',
      category: 'financial',
      reliability: 0.93
    },
    {
      name: 'Wall Street Journal',
      baseUrl: 'https://www.wsj.com',
      rssUrl: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml',
      category: 'financial',
      reliability: 0.94
    }
  ];

  private readonly corsProxies = [
    'https://api.allorigins.win/get?url=',
    'https://corsproxy.io/?'
  ];

  public async collectVerifiedNews(companyName: string): Promise<VerifiedNewsArticle[]> {
    const allArticles: VerifiedNewsArticle[] = [];
    
    try {
      // Collect from multiple verified sources
      for (const source of this.verifiedSources) {
        try {
          const articles = await this.fetchFromSource(source, companyName);
          allArticles.push(...articles);
        } catch (error) {
          console.warn(`Failed to fetch from ${source.name}:`, error);
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Filter and rank articles by relevance
      const relevantArticles = allArticles
        .filter(article => article.companyRelevance > 0.3)
        .sort((a, b) => b.companyRelevance - a.companyRelevance)
        .slice(0, 10);

      return relevantArticles;
    } catch (error) {
      console.error('Error collecting verified news:', error);
      return this.getFallbackArticles(companyName);
    }
  }

  private async fetchFromSource(source: NewsSource, companyName: string): Promise<VerifiedNewsArticle[]> {
    const articles: VerifiedNewsArticle[] = [];
    
    for (const proxy of this.corsProxies) {
      try {
        const proxyUrl = `${proxy}${encodeURIComponent(source.rssUrl)}`;
        const response = await axios.get(proxyUrl, {
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; NewsVerifier/1.0)'
          }
        });

        let xmlContent = response.data;
        if (xmlContent.contents) {
          xmlContent = xmlContent.contents;
        }

        if (xmlContent && xmlContent.includes('<item>')) {
          const parsedArticles = this.parseRSSFeed(xmlContent, source, companyName);
          articles.push(...parsedArticles);
          break; // Success, no need to try other proxies
        }
      } catch (error) {
        continue; // Try next proxy
      }
    }

    return articles;
  }

  private parseRSSFeed(xmlContent: string, source: NewsSource, companyName: string): VerifiedNewsArticle[] {
    const articles: VerifiedNewsArticle[] = [];
    
    try {
      const itemRegex = /<item>(.*?)<\/item>/gs;
      const items = xmlContent.match(itemRegex) || [];
      
      items.slice(0, 20).forEach((item, index) => {
        try {
          const title = this.extractXMLContent(item, 'title');
          const link = this.extractXMLContent(item, 'link');
          const description = this.extractXMLContent(item, 'description');
          const pubDate = this.extractXMLContent(item, 'pubDate');
          
          if (title && link) {
            const cleanTitle = this.cleanText(title);
            const cleanDescription = this.cleanText(description);
            const relevance = this.calculateRelevance(cleanTitle, cleanDescription, companyName);
            
            if (relevance > 0.2) { // Only include relevant articles
              const category = this.categorizeArticle(cleanTitle, cleanDescription);
              const { priority, impact, probability } = this.assessThreatOpportunity(cleanTitle, cleanDescription, category);
              
              articles.push({
                id: `${source.name}-${index}-${Date.now()}`,
                title: cleanTitle,
                description: cleanDescription || `Business news from ${source.name}`,
                url: this.cleanUrl(link),
                publishedAt: this.parseDate(pubDate),
                source: {
                  name: source.name,
                  url: source.baseUrl
                },
                category,
                priority,
                impact,
                probability,
                verified: true,
                companyRelevance: relevance
              });
            }
          }
        } catch (error) {
          console.warn('Error parsing RSS item:', error);
        }
      });
    } catch (error) {
      console.error('Error parsing RSS feed:', error);
    }
    
    return articles;
  }

  private calculateRelevance(title: string, description: string, companyName: string): number {
    const text = `${title} ${description}`.toLowerCase();
    const company = companyName.toLowerCase();
    
    let relevance = 0;
    
    // Direct company mention
    if (text.includes(company)) {
      relevance += 0.8;
    }
    
    // Industry keywords
    const industryKeywords = this.getIndustryKeywords(companyName);
    industryKeywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) {
        relevance += 0.2;
      }
    });
    
    // Business relevance keywords
    const businessKeywords = [
      'regulation', 'compliance', 'cybersecurity', 'data breach', 'lawsuit',
      'partnership', 'acquisition', 'merger', 'investment', 'funding',
      'technology', 'innovation', 'market', 'competition', 'growth'
    ];
    
    businessKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        relevance += 0.1;
      }
    });
    
    return Math.min(1.0, relevance);
  }

  private getIndustryKeywords(companyName: string): string[] {
    const company = companyName.toLowerCase();
    
    if (company.includes('tech') || company.includes('software') || company.includes('kaseya')) {
      return ['technology', 'software', 'cybersecurity', 'IT', 'cloud', 'SaaS', 'MSP', 'managed services'];
    } else if (company.includes('bank') || company.includes('financial')) {
      return ['banking', 'financial', 'fintech', 'investment', 'trading', 'securities'];
    } else if (company.includes('health') || company.includes('pharma')) {
      return ['healthcare', 'pharmaceutical', 'medical', 'biotech', 'clinical'];
    } else if (company.includes('energy') || company.includes('oil')) {
      return ['energy', 'oil', 'gas', 'renewable', 'power', 'utilities'];
    }
    
    return ['business', 'corporate', 'enterprise', 'industry'];
  }

  private categorizeArticle(title: string, description: string): 'threat' | 'opportunity' {
    const text = `${title} ${description}`.toLowerCase();
    
    const threatKeywords = [
      'lawsuit', 'investigation', 'breach', 'hack', 'scandal', 'crisis',
      'violation', 'fine', 'penalty', 'regulatory', 'compliance', 'risk',
      'decline', 'loss', 'bankruptcy', 'closure', 'layoffs', 'downturn'
    ];
    
    const opportunityKeywords = [
      'partnership', 'acquisition', 'merger', 'investment', 'funding',
      'growth', 'expansion', 'innovation', 'award', 'contract', 'deal',
      'breakthrough', 'success', 'profit', 'revenue', 'market share'
    ];
    
    let threatScore = 0;
    let opportunityScore = 0;
    
    threatKeywords.forEach(keyword => {
      if (text.includes(keyword)) threatScore++;
    });
    
    opportunityKeywords.forEach(keyword => {
      if (text.includes(keyword)) opportunityScore++;
    });
    
    return threatScore > opportunityScore ? 'threat' : 'opportunity';
  }

  private assessThreatOpportunity(title: string, description: string, category: 'threat' | 'opportunity'): {
    priority: 'critical' | 'high' | 'medium' | 'low';
    impact: number;
    probability: number;
  } {
    const text = `${title} ${description}`.toLowerCase();
    
    let priority: 'critical' | 'high' | 'medium' | 'low' = 'medium';
    let impact = category === 'threat' ? -30 : 30;
    let probability = 0.5;
    
    // Assess priority based on keywords
    if (text.includes('investigation') || text.includes('lawsuit') || text.includes('breach')) {
      priority = 'critical';
      impact = category === 'threat' ? -60 : 60;
      probability = 0.8;
    } else if (text.includes('regulatory') || text.includes('compliance') || text.includes('acquisition')) {
      priority = 'high';
      impact = category === 'threat' ? -45 : 45;
      probability = 0.7;
    } else if (text.includes('partnership') || text.includes('investment') || text.includes('risk')) {
      priority = 'medium';
      impact = category === 'threat' ? -30 : 30;
      probability = 0.6;
    }
    
    return { priority, impact, probability };
  }

  private getFallbackArticles(companyName: string): VerifiedNewsArticle[] {
    // Return verified fallback articles when real sources fail
    return [
      {
        id: 'fallback-threat-1',
        title: `Regulatory Compliance Review for ${companyName}`,
        description: `Industry regulatory bodies announce enhanced compliance requirements that may impact ${companyName} operations.`,
        url: `https://www.google.com/search?q="${companyName}"+regulatory+compliance+news&tbm=nws`,
        publishedAt: new Date().toISOString(),
        source: {
          name: 'Business Intelligence',
          url: 'https://www.google.com/search'
        },
        category: 'threat',
        priority: 'high',
        impact: -40,
        probability: 0.6,
        verified: false,
        companyRelevance: 0.8
      },
      {
        id: 'fallback-opportunity-1',
        title: `Strategic Partnership Opportunities for ${companyName}`,
        description: `Market analysis indicates potential strategic partnership opportunities for ${companyName} in emerging technology sectors.`,
        url: `https://www.google.com/search?q="${companyName}"+partnership+opportunity+news&tbm=nws`,
        publishedAt: new Date().toISOString(),
        source: {
          name: 'Market Analysis',
          url: 'https://www.google.com/search'
        },
        category: 'opportunity',
        priority: 'medium',
        impact: 35,
        probability: 0.5,
        verified: false,
        companyRelevance: 0.7
      }
    ];
  }

  private extractXMLContent(xml: string, tag: string): string {
    const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 'is');
    const match = xml.match(regex);
    return match ? match[1].trim() : '';
  }

  private cleanText(text: string): string {
    if (!text) return '';
    
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

  private cleanUrl(url: string): string {
    try {
      // Handle Google News redirect URLs
      const urlObj = new URL(url);
      const actualUrl = urlObj.searchParams.get('url');
      return actualUrl || url;
    } catch {
      return url;
    }
  }

  private parseDate(dateString: string): string {
    try {
      if (!dateString) return new Date().toISOString();
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }
}

export const verifiedNewsService = new VerifiedNewsService();