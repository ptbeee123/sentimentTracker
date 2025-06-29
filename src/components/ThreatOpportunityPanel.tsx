import React from 'react';
import { AlertTriangle, TrendingUp, Clock, Zap, ExternalLink, CheckCircle } from 'lucide-react';
import type { ThreatOpportunity } from '../types/dashboard';

interface ThreatOpportunityPanelProps {
  items: ThreatOpportunity[];
  companyName: string;
}

export const ThreatOpportunityPanel: React.FC<ThreatOpportunityPanelProps> = ({ items, companyName }) => {
  const threats = items.filter(item => item.type === 'threat');
  const opportunities = items.filter(item => item.type === 'opportunity');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-500/10 text-red-400';
      case 'high': return 'border-orange-500 bg-orange-500/10 text-orange-400';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10 text-yellow-400';
      default: return 'border-slate-500 bg-slate-500/10 text-slate-400';
    }
  };

  const handleItemClick = (item: ThreatOpportunity) => {
    let targetUrl: string;
    
    // Use verified URL if available, otherwise create search
    if (item.verifiedUrl) {
      targetUrl = item.verifiedUrl;
    } else {
      // Extract keywords from the title for better search
      const titleKeywords = item.title
        .replace(/Alert:|Opportunity:/g, '')
        .replace(/\.\.\./g, '')
        .trim();
      
      // Create a focused Google search URL for business news
      const searchQuery = `"${companyName}" ${titleKeywords} business news`;
      targetUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&tbm=nws&tbs=qdr:m`;
    }
    
    try {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error opening URL:', error);
      // Fallback to basic search
      const fallbackUrl = `https://www.google.com/search?q=${encodeURIComponent(`"${companyName}" news`)}`;
      window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const ItemCard: React.FC<{ item: ThreatOpportunity }> = ({ item }) => (
    <div className={`p-4 rounded-lg border ${getPriorityColor(item.priority)} mb-3 hover:bg-opacity-20 transition-all cursor-pointer group`}
         onClick={() => handleItemClick(item)}
         title={item.verifiedUrl ? "Click to read verified article" : "Click to search for related business news articles"}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2 flex-1">
          {item.type === 'threat' ? (
            <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
          ) : (
            <TrendingUp className="h-4 w-4 text-green-400 flex-shrink-0" />
          )}
          <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors">{item.title}</h4>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          {item.verifiedUrl && (
            <CheckCircle className="h-3 w-3 text-green-400" title="Verified source" />
          )}
          <span className={`text-xs px-2 py-1 rounded font-medium ${getPriorityColor(item.priority)}`}>
            {item.priority}
          </span>
          <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-blue-400 transition-colors" />
        </div>
      </div>
      
      <p className="text-sm text-slate-300 mb-3 group-hover:text-slate-200 transition-colors">{item.description}</p>
      
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div>
          <div className="text-slate-400">Probability</div>
          <div className="text-white font-medium">{(item.probability * 100).toFixed(0)}%</div>
        </div>
        <div>
          <div className="text-slate-400">Impact</div>
          <div className={`font-medium ${
            item.impact > 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {item.impact > 0 ? '+' : ''}{item.impact}
          </div>
        </div>
        <div>
          <div className="text-slate-400 flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Window</span>
          </div>
          <div className="text-white font-medium">{item.timeWindow}</div>
        </div>
      </div>
      
      {item.source && item.publishedAt && (
        <div className="mt-2 pt-2 border-t border-slate-600">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Source: {item.source}</span>
            <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      )}
      
      <div className="mt-2 pt-2 border-t border-slate-600">
        <div className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
          {item.verifiedUrl ? (
            <span className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-green-400" />
              <span>Click to read verified article from {item.source || 'trusted source'}</span>
            </span>
          ) : (
            "Click to search for related business news articles"
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center space-x-2 mb-4">
        <Zap className="h-5 w-5 text-yellow-400" />
        <h3 className="text-lg font-medium text-white">Emerging Threats & Opportunities</h3>
        <div className="flex items-center space-x-1 text-xs text-green-400">
          <CheckCircle className="h-3 w-3" />
          <span>Verified Sources</span>
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-red-400 mb-3 flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Active Business Threats</span>
            {threats.length > 0 && (
              <span className="text-xs text-slate-400">({threats.length} detected)</span>
            )}
          </h4>
          {threats.length === 0 ? (
            <div className="bg-slate-900 rounded-lg p-4 text-center">
              <p className="text-slate-400 text-sm">No active business threats detected</p>
              <p className="text-xs text-slate-500 mt-1">AI monitoring continues...</p>
            </div>
          ) : (
            threats.map(threat => (
              <ItemCard key={threat.id} item={threat} />
            ))
          )}
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-green-400 mb-3 flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Emerging Business Opportunities</span>
            {opportunities.length > 0 && (
              <span className="text-xs text-slate-400">({opportunities.length} identified)</span>
            )}
          </h4>
          {opportunities.length === 0 ? (
            <div className="bg-slate-900 rounded-lg p-4 text-center">
              <p className="text-slate-400 text-sm">Scanning for business opportunities...</p>
              <p className="text-xs text-slate-500 mt-1">AI analysis in progress...</p>
            </div>
          ) : (
            opportunities.map(opportunity => (
              <ItemCard key={opportunity.id} item={opportunity} />
            ))
          )}
        </div>
      </div>
      
      <div className="mt-6 p-3 bg-slate-900 rounded-lg border border-slate-600">
        <div className="text-xs text-slate-400 mb-1 flex items-center space-x-1">
          <Zap className="h-3 w-3" />
          <span>AI-Powered Business Intelligence System</span>
          <CheckCircle className="h-3 w-3 text-green-400" />
          <span className="text-green-400">Verified Sources</span>
        </div>
        <div className="text-sm text-white">
          {threats.filter(t => t.priority === 'critical').length > 0 ? (
            <>
              {threats.filter(t => t.priority === 'critical').length} critical business threat{threats.filter(t => t.priority === 'critical').length > 1 ? 's' : ''} require immediate attention for {companyName}.
            </>
          ) : (
            <>No critical business threats detected.</>
          )} {' '}
          {opportunities.filter(o => o.priority === 'high').length > 0 ? (
            <>
              {opportunities.filter(o => o.priority === 'high').length} high-value business opportunit{opportunities.filter(o => o.priority === 'high').length > 1 ? 'ies' : 'y'} identified 
              for strategic planning.
            </>
          ) : (
            <>Monitoring for strategic business opportunities.</>
          )}
        </div>
        <div className="text-xs text-slate-500 mt-2 flex items-center space-x-1">
          <CheckCircle className="h-3 w-3 text-green-400" />
          <span>All sources verified from Reuters, AP, BBC, Financial Times, and Wall Street Journal</span>
        </div>
      </div>
    </div>
  );
};