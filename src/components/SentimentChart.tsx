import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Tooltip, Legend } from 'recharts';
import { format } from 'date-fns';
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { getDateRange, filterDataByDateRange, filterEventsByDateRange, calculateRangeMetrics } from '../utils/dateUtils';
import type { SentimentData, CrisisEvent } from '../types/dashboard';

interface SentimentChartProps {
  data: SentimentData[];
  hourlyData: SentimentData[];
  events: CrisisEvent[];
  companyName: string;
  onTimeframeChange?: (timeframe: '24h' | '7d' | '30d' | '1y' | 'all') => void;
  hasVerifiedCrisis?: boolean;
  crisisVerificationConfidence?: number;
}

export const SentimentChart: React.FC<SentimentChartProps> = ({ 
  data, 
  hourlyData, 
  events, 
  companyName,
  onTimeframeChange,
  hasVerifiedCrisis = false,
  crisisVerificationConfidence = 0
}) => {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | '1y' | 'all'>('30d');

  const handleTimeframeChange = (newTimeframe: '24h' | '7d' | '30d' | '1y' | 'all') => {
    setTimeframe(newTimeframe);
    if (onTimeframeChange) {
      onTimeframeChange(newTimeframe);
    }
  };

  const { chartData, filteredEvents, dateRange, rangeMetrics } = useMemo(() => {
    const dateRange = getDateRange(timeframe);
    let dataset = data;
    
    if (timeframe === '24h') {
      dataset = hourlyData;
    }
    
    // Filter data based on date range
    const filteredData = filterDataByDateRange(dataset, dateRange);
    
    // Only show events if they are verified
    const filteredEvents = hasVerifiedCrisis ? 
      filterEventsByDateRange(events, dateRange) : [];
    
    // Calculate metrics for this range
    const rangeMetrics = calculateRangeMetrics(filteredData, dateRange);
    
    const chartData = filteredData.map(item => ({
      ...item,
      formattedTime: format(item.timestamp, dateRange.formatString)
    }));

    return { chartData, filteredEvents, dateRange, rangeMetrics };
  }, [timeframe, data, hourlyData, events, hasVerifiedCrisis]);

  const getVerificationIcon = () => {
    if (!hasVerifiedCrisis) return null;
    
    if (crisisVerificationConfidence >= 0.8) {
      return <CheckCircle className="h-4 w-4 text-green-400" title="High confidence verification" />;
    } else if (crisisVerificationConfidence >= 0.7) {
      return <Shield className="h-4 w-4 text-yellow-400" title="Medium confidence verification" />;
    } else {
      return <AlertTriangle className="h-4 w-4 text-orange-400" title="Low confidence verification" />;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 shadow-lg">
          <p className="text-slate-300 font-medium">{label}</p>
          <p className="text-blue-400">
            Sentiment: <span className="font-mono">{data.sentiment}</span>
          </p>
          <p className="text-green-400">
            Volume: <span className="font-mono">{data.volume.toLocaleString()}</span>
          </p>
          <p className="text-yellow-400">
            Confidence: <span className="font-mono">{(data.confidence * 100).toFixed(1)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <h2 className="text-lg font-medium text-white">Executive Sentiment Command Center</h2>
            {hasVerifiedCrisis && (
              <div className="flex items-center space-x-1">
                {getVerificationIcon()}
                <span className="text-xs text-green-400">
                  Verified Events ({(crisisVerificationConfidence * 100).toFixed(0)}% confidence)
                </span>
              </div>
            )}
          </div>
          <p className="text-sm text-slate-400">
            Real-time sentiment analysis for <span className="text-blue-400 font-medium">{companyName}</span>
            <span className="ml-2 text-xs">
              ({dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()})
            </span>
            {hasVerifiedCrisis && (
              <span className="ml-2 text-xs text-green-400">
                • Multi-source verified crisis events
              </span>
            )}
          </p>
        </div>
        <div className="flex space-x-2">
          {(['24h', '7d', '30d', '1y', 'all'] as const).map((period) => (
            <button
              key={period}
              onClick={() => handleTimeframeChange(period)}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                timeframe === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {period === 'all' ? 'ALL' : period.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Range Metrics Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900 rounded-lg p-3">
          <div className="text-xs text-slate-400">Average Sentiment</div>
          <div className={`text-lg font-medium ${
            rangeMetrics.averageSentiment > 0 ? 'text-green-400' : 
            rangeMetrics.averageSentiment > -25 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {rangeMetrics.averageSentiment > 0 ? '+' : ''}{rangeMetrics.averageSentiment}
          </div>
          <div className="text-xs text-slate-500">
            Trend: {rangeMetrics.sentimentTrend > 0 ? '+' : ''}{rangeMetrics.sentimentTrend.toFixed(1)}%
          </div>
        </div>
        
        <div className="bg-slate-900 rounded-lg p-3">
          <div className="text-xs text-slate-400">Total Volume</div>
          <div className="text-lg font-medium text-white">
            {rangeMetrics.totalVolume.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">
            Trend: {rangeMetrics.volumeTrend > 0 ? '+' : ''}{rangeMetrics.volumeTrend.toFixed(1)}%
          </div>
        </div>
        
        <div className="bg-slate-900 rounded-lg p-3">
          <div className="text-xs text-slate-400">Data Points</div>
          <div className="text-lg font-medium text-white">
            {rangeMetrics.dataPoints.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">
            {dateRange.label}
          </div>
        </div>
        
        <div className="bg-slate-900 rounded-lg p-3">
          <div className="flex items-center space-x-1 text-xs text-slate-400">
            <span>Verified Events</span>
            {hasVerifiedCrisis && getVerificationIcon()}
          </div>
          <div className="text-lg font-medium text-white">
            {filteredEvents.length}
          </div>
          <div className="text-xs text-slate-500">
            {hasVerifiedCrisis ? 'Multi-source verified' : 'No verified events'}
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="formattedTime" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              domain={[-100, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="2 2" />
            
            {/* Crisis events as reference lines - only show if verified */}
            {hasVerifiedCrisis && (timeframe === '30d' || timeframe === '1y' || timeframe === 'all') && 
             filteredEvents.map((event, index) => (
              <ReferenceLine
                key={index}
                x={format(event.date, dateRange.formatString)}
                stroke={event.type === 'crisis' ? '#EF4444' : event.type === 'response' ? '#3B82F6' : '#10B981'}
                strokeDasharray="4 4"
                label={{ 
                  value: event.title.substring(0, 20) + (event.title.length > 20 ? '...' : ''), 
                  position: 'topLeft', 
                  fontSize: 10,
                  fill: event.type === 'crisis' ? '#EF4444' : event.type === 'response' ? '#3B82F6' : '#10B981'
                }}
              />
            ))}
            
            <Line
              type="monotone"
              dataKey="sentiment"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: '#3B82F6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
        <div className="flex items-center space-x-4">
          <span>Confidence interval: ±{((chartData[chartData.length - 1]?.confidence || 0.85) * 10).toFixed(1)} points</span>
          {hasVerifiedCrisis && (
            <div className="flex items-center space-x-1">
              {getVerificationIcon()}
              <span className="text-green-400">
                Crisis events verified across {crisisVerificationConfidence >= 0.8 ? '3+' : '2+'} sources
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <span>Data Points: <span className="text-white font-mono">{chartData.length.toLocaleString()}</span></span>
          <span>Date Range: <span className="text-blue-400">{dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}</span></span>
          <span>Crisis Recovery Benchmark: <span className="text-yellow-400">Day +60 target</span></span>
        </div>
      </div>
    </div>
  );
};