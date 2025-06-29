import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { KPIMetrics } from '../types/dashboard';

interface KPIStripProps {
  metrics: KPIMetrics;
}

const KPICard: React.FC<{
  title: string;
  value: number;
  isPercentage?: boolean;
  trend?: number;
  format?: 'sentiment' | 'percentage' | 'index';
}> = ({ title, value, trend, format = 'sentiment' }) => {
  const formatValue = (val: number) => {
    // Ensure whole numbers only
    const wholeNumber = Math.round(val);
    
    switch (format) {
      case 'percentage':
        return `${wholeNumber}%`;
      case 'index':
        return wholeNumber.toString();
      case 'sentiment':
      default:
        return wholeNumber > 0 ? `+${wholeNumber}` : wholeNumber.toString();
    }
  };

  const getValueColor = (val: number) => {
    const wholeNumber = Math.round(val);
    
    if (format === 'percentage' || format === 'index') {
      return wholeNumber > 50 ? 'text-green-400' : wholeNumber > 25 ? 'text-yellow-400' : 'text-red-400';
    }
    return wholeNumber > 0 ? 'text-green-400' : wholeNumber > -25 ? 'text-yellow-400' : 'text-red-400';
  };

  const getTrendIcon = () => {
    if (!trend) return <Minus className="h-4 w-4 text-slate-400" />;
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-400" />;
    return <TrendingDown className="h-4 w-4 text-red-400" />;
  };

  return (
    <div className="bg-slate-800 rounded-lg px-6 py-4 border border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-slate-300">{title}</h3>
        {getTrendIcon()}
      </div>
      <div className={`text-2xl font-light ${getValueColor(value)}`}>
        {formatValue(value)}
      </div>
      {trend !== undefined && (
        <div className="text-xs text-slate-400 mt-1">
          {trend > 0 ? '+' : ''}{trend.toFixed(1)}% vs. yesterday
        </div>
      )}
    </div>
  );
};

export const KPIStrip: React.FC<KPIStripProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-5 gap-6 mb-8">
      <KPICard
        title="Overall Sentiment Score"
        value={metrics.overallSentiment}
        trend={3.2}
        format="sentiment"
      />
      <KPICard
        title="Recovery Velocity Index"
        value={metrics.recoveryVelocity}
        trend={8.1}
        format="percentage"
      />
      <KPICard
        title="Stakeholder Confidence"
        value={metrics.stakeholderConfidence}
        trend={-2.3}
        format="index"
      />
      <KPICard
        title="Competitive Advantage"
        value={metrics.competitiveAdvantage}
        trend={1.8}
        format="sentiment"
      />
      <KPICard
        title="Media Narrative Momentum"
        value={metrics.mediaMomentum}
        trend={5.4}
        format="percentage"
      />
    </div>
  );
};