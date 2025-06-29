import React from 'react';
import { Newspaper, ExternalLink, Calendar, Building } from 'lucide-react';
import { format } from 'date-fns';
import type { NewsArticle } from '../services/realDataCollection';

interface NewsArticlesPanelProps {
  articles: NewsArticle[];
  companyName: string;
}

export const NewsArticlesPanel: React.FC<NewsArticlesPanelProps> = ({ articles, companyName }) => {
  // Sort articles by date descending and limit to top 5
  const sortedArticles = [...articles]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 5);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Recent';
    }
  };

  const getSourceColor = (sourceName: string) => {
    const colors = {
      'Reuters': 'text-blue-400',
      'Bloomberg': 'text-green-400',
      'Financial Times': 'text-orange-400',
      'Wall Street Journal': 'text-purple-400',
      'TechCrunch': 'text-red-400',
      'CyberScoop': 'text-cyan-400',
      'Dark Reading': 'text-indigo-400',
      'Security Week': 'text-yellow-400',
      'Google News': 'text-emerald-400'
    };
    return colors[sourceName as keyof typeof colors] || 'text-slate-400';
  };

  const handleHeadlineClick = (url: string, title: string) => {
    // Always open the URL - it's either a direct link or a Google search
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error opening URL:', error);
      // Final fallback to Google search
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(title + ' ' + companyName)}`;
      window.open(searchUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Newspaper className="h-5 w-5 text-blue-400" />
          <div>
            <h3 className="text-lg font-medium text-white">Recent News Coverage</h3>
            <p className="text-xs text-slate-400">Top 5 headlines about {companyName} from Google News (newest first)</p>
          </div>
        </div>
        <div className="text-xs text-slate-400">
          {sortedArticles.length > 0 ? `${sortedArticles.length} articles` : 'Collecting...'}
        </div>
      </div>

      {sortedArticles.length === 0 ? (
        <div className="bg-slate-900 rounded-lg p-6 text-center">
          <Building className="h-6 w-6 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">Collecting news articles from Google News...</p>
          <p className="text-xs text-slate-500 mt-1">Agent swarm is fetching latest news data for {companyName}</p>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-lg p-4">
          <div className="space-y-3">
            {sortedArticles.map((article, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-b-0">
                <div className="flex-1 min-w-0 pr-4">
                  <button
                    onClick={() => handleHeadlineClick(article.url, article.title)}
                    className="text-sm text-white hover:text-blue-400 transition-colors cursor-pointer text-left w-full truncate"
                    title={`Click to read: ${article.title}`}
                  >
                    {article.title}
                  </button>
                </div>
                
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <span className={`text-xs font-medium ${getSourceColor(article.source.name)}`}>
                    {article.source.name}
                  </span>
                  <div className="flex items-center space-x-1 text-xs text-slate-400">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(article.publishedAt)}</span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-slate-500" />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-700">
            <div className="text-xs text-slate-400 mb-1 flex items-center space-x-1">
              <Newspaper className="h-3 w-3" />
              <span>Google News Intelligence Summary</span>
            </div>
            <div className="text-sm text-white">
              {sortedArticles.length > 0 ? (
                <>
                  Monitoring {sortedArticles.length} recent articles about {companyName} from Google News. 
                  Latest coverage from {sortedArticles[0]?.source.name || 'major outlets'} shows 
                  {sortedArticles.length > 3 ? 'increased' : 'moderate'} media attention.
                </>
              ) : (
                `Actively scanning Google News for ${companyName} coverage. Real-time collection in progress.`
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};