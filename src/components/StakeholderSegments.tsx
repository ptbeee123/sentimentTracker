import React from 'react';
import { Users, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import type { StakeholderSegment } from '../types/dashboard';

interface StakeholderSegmentsProps {
  segments: StakeholderSegment[];
  companyName: string;
}

export const StakeholderSegments: React.FC<StakeholderSegmentsProps> = ({ segments, companyName }) => {
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-400" />;
      case 'medium':
        return <Users className="h-4 w-4 text-yellow-400" />;
      default:
        return <Users className="h-4 w-4 text-slate-400" />;
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-400" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-400" />;
    return null;
  };

  const sortedSegments = [...segments].sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h3 className="text-lg font-medium text-white mb-4">Stakeholder Segment Analysis</h3>
      
      <div className="space-y-3">
        {sortedSegments.map((segment) => (
          <div key={segment.segment} className="bg-slate-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getPriorityIcon(segment.priority)}
                <h4 className="font-medium text-white">{segment.segment}</h4>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-mono ${
                  segment.sentiment > 0 ? 'text-green-400' : 
                  segment.sentiment > -25 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {segment.sentiment > 0 ? '+' : ''}{segment.sentiment}
                </span>
                {getTrendIcon(segment.trend)}
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>{segment.volume.toLocaleString()} mentions</span>
              <span className={`font-medium ${
                segment.trend > 0 ? 'text-green-400' : 
                segment.trend < 0 ? 'text-red-400' : 'text-slate-400'
              }`}>
                {segment.trend > 0 ? '+' : ''}{segment.trend}% trend
              </span>
            </div>
            
            <div className="mt-2 bg-slate-700 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  segment.sentiment > 0 ? 'bg-green-400' : 
                  segment.sentiment > -25 ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                style={{
                  width: `${Math.max(5, Math.min(100, (segment.sentiment + 100) / 2))}%`
                }}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-slate-900 rounded-lg border border-slate-600">
        <div className="text-xs text-slate-400 mb-1">Key Insights</div>
        <div className="text-sm text-white">
          {segments.find(s => s.priority === 'critical')?.segment || 'Investor'} sentiment remains critical concern for {companyName}. 
          Employee advocacy showing positive momentum. 
          Focus on regulatory engagement recommended.
        </div>
      </div>
    </div>
  );
};