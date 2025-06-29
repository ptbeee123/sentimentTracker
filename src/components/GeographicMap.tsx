import React from 'react';
import { Globe, MapPin } from 'lucide-react';
import type { GeographicData } from '../types/dashboard';

interface GeographicMapProps {
  regions: GeographicData[];
  companyName: string;
}

export const GeographicMap: React.FC<GeographicMapProps> = ({ regions, companyName }) => {
  const getRiskColor = (risk: number) => {
    if (risk > 75) return 'bg-red-500';
    if (risk > 50) return 'bg-orange-500';
    if (risk > 25) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getRiskLabel = (risk: number) => {
    if (risk > 75) return 'Critical';
    if (risk > 50) return 'High';
    if (risk > 25) return 'Medium';
    return 'Low';
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center space-x-2 mb-4">
        <Globe className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-medium text-white">Geographic Intelligence Map</h3>
      </div>
      
      <div className="space-y-4">
        {regions.map((region) => (
          <div key={region.region} className="bg-slate-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                <h4 className="font-medium text-white">{region.region}</h4>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(region.risk)} text-white`}>
                  {getRiskLabel(region.risk)}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-slate-400">Sentiment</div>
                <div className={`font-medium ${
                  region.sentiment > 0 ? 'text-green-400' : 
                  region.sentiment > -25 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {region.sentiment > 0 ? '+' : ''}{region.sentiment}
                </div>
              </div>
              <div>
                <div className="text-slate-400">Volume</div>
                <div className="text-white font-medium">{region.volume.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-slate-400">Risk Score</div>
                <div className="text-white font-medium">{region.risk}/100</div>
              </div>
            </div>
            
            <div className="mt-3 bg-slate-700 rounded-full h-2">
              <div
                className={getRiskColor(region.risk)}
                style={{ width: `${region.risk}%` }}
                className={`h-2 rounded-full transition-all duration-300 ${getRiskColor(region.risk)}`}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-slate-900 rounded-lg border border-slate-600">
        <div className="text-xs text-slate-400 mb-1">Regional Strategy Recommendations</div>
        <div className="text-sm text-white">
          {regions.find(r => r.risk > 75)?.region || 'Asia Pacific'} requires immediate attention. 
          {regions.find(r => r.risk < 40)?.region || 'North America'} showing stabilization. 
          European markets present expansion opportunity for {companyName}.
        </div>
      </div>
    </div>
  );
};