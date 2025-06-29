import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { Target, TrendingUp, TrendingDown } from 'lucide-react';
import type { CompetitorData } from '../types/dashboard';

interface CompetitiveLandscapeProps {
  competitors: CompetitorData[];
  companyName: string;
}

export const CompetitiveLandscape: React.FC<CompetitiveLandscapeProps> = ({ competitors, companyName }) => {
  const chartData = competitors.map(comp => ({
    name: comp.name.replace(/Corp|Corporation/g, '').trim(),
    sentiment: comp.sentiment,
    marketShare: comp.marketShare
  }));

  const getBarColor = (sentiment: number) => {
    if (sentiment > 10) return '#10B981';
    if (sentiment > 0) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center space-x-2 mb-4">
        <Target className="h-5 w-5 text-purple-400" />
        <h3 className="text-lg font-medium text-white">Competitive Landscape Monitor</h3>
      </div>
      
      <div className="h-48 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <XAxis 
              dataKey="name" 
              stroke="#9CA3AF"
              fontSize={11}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={11}
            />
            <Bar dataKey="sentiment" radius={[2, 2, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.sentiment)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="space-y-3">
        {competitors.map((competitor) => (
          <div key={competitor.name} className="bg-slate-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-white">{competitor.name}</h4>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-mono ${
                  competitor.sentiment > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {competitor.sentiment > 0 ? '+' : ''}{competitor.sentiment}
                </span>
                {competitor.trend > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-400" />
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-slate-400">Market Share</div>
                <div className="text-white font-medium">{competitor.marketShare}%</div>
              </div>
              <div>
                <div className="text-slate-400">Trend</div>
                <div className={`font-medium ${
                  competitor.trend > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {competitor.trend > 0 ? '+' : ''}{competitor.trend}%
                </div>
              </div>
              <div>
                <div className="text-slate-400">Advantage</div>
                <div className={`font-medium ${
                  competitor.advantage > 20 ? 'text-green-400' : 
                  competitor.advantage > 0 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {competitor.advantage}pts
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-slate-900 rounded-lg border border-slate-600">
        <div className="text-xs text-slate-400 mb-1">Competitive Intelligence</div>
        <div className="text-sm text-white">
          {competitors[0]?.name} gaining momentum. Consider defensive positioning. 
          {competitors[2]?.name} vulnerability presents opportunity for {companyName}.
        </div>
      </div>
    </div>
  );
};