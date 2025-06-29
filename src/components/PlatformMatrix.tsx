import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { Smartphone } from 'lucide-react';
import type { PlatformMetrics } from '../types/dashboard';

interface PlatformMatrixProps {
  platforms: PlatformMetrics[];
  companyName: string;
}

export const PlatformMatrix: React.FC<PlatformMatrixProps> = ({ platforms, companyName }) => {
  const getBarColor = (sentiment: number) => {
    if (sentiment > 0) return '#10B981';
    if (sentiment > -25) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center space-x-2 mb-4">
        <Smartphone className="h-5 w-5 text-blue-400" />
        <div>
          <h3 className="text-lg font-medium text-white">Platform Performance Matrix</h3>
          <p className="text-xs text-slate-400">{companyName} cross-platform sentiment</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {platforms.map((platform) => (
          <div key={platform.platform} className="bg-slate-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-white">{platform.platform}</h4>
              <div className={`text-lg font-mono ${
                platform.sentiment > 0 ? 'text-green-400' : 
                platform.sentiment > -25 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {platform.sentiment > 0 ? '+' : ''}{platform.sentiment.toFixed(2)}
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-3 text-sm">
              <div>
                <div className="text-slate-400">Volume</div>
                <div className="text-white font-medium">{platform.volume.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-slate-400">Engagement</div>
                <div className="text-white font-medium">{platform.engagement.toFixed(2)}%</div>
              </div>
              <div>
                <div className="text-slate-400">Reach</div>
                <div className="text-white font-medium">{(platform.reach / 1000000).toFixed(2)}M</div>
              </div>
              <div>
                <div className="text-slate-400">Confidence</div>
                <div className="text-white font-medium">{(platform.confidence * 100).toFixed(2)}%</div>
              </div>
            </div>
            
            <div className="mt-3 bg-slate-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  platform.sentiment > 0 ? 'bg-green-400' : 
                  platform.sentiment > -25 ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                style={{
                  width: `${Math.max(5, Math.min(100, (platform.sentiment + 100) / 2))}%`
                }}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-slate-900 rounded-lg border border-slate-600">
        <div className="text-xs text-slate-400 mb-1">Platform Intelligence Summary</div>
        <div className="text-sm text-white">
          {companyName} showing strongest performance on professional networks. 
          Social platforms require targeted engagement strategy.
        </div>
      </div>
    </div>
  );
};