import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Tooltip, Legend } from 'recharts';
import { format } from 'date-fns';
import { getDateRange, filterDataByDateRange, filterEventsByDateRange, calculateRangeMetrics } from '../utils/dateUtils';
import type { SentimentData, CrisisEvent } from '../types/dashboard';

interface SentimentChartProps {
  data: SentimentData[];
  hourlyData: SentimentData[];
  events: CrisisEvent[];
  companyName: string;
  onTimeframeChange?: (timeframe: '24h' | '7d' | '30d' | '1y' | 'all') => void;
}

export const SentimentChart: React.FC<SentimentChartProps> = ({ 
  data, 
  hourlyData, 
  events, 
  companyName,
  onTimeframeChange 
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
    const filteredEvents = filterEventsByDateRange(events, dateRange);
    
    // Calculate metrics for this range - FIXED: Ensure proper volume calculation
    const rangeMetrics = calculateRangeMetrics(filteredData, dateRange);
    
    const chartData = filteredData.map(item => ({
      ...item,
      formattedTime: format(item.timestamp, dateRange.formatString)
    }));

    return { chartData, filteredEvents, dateRange, rangeMetrics };
  }, [timeframe, data, hourlyData, events]);

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
          <h2 className="text-lg font-medium text-white">Executive Sentiment Command Center</h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time sentiment analysis for <span className="text-blue-400 font-medium">{companyName}</span>
            <span className="ml-2 text-xs">
              ({dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()})
            </span>
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
          <div className="text-xs text-slate-400">Events</div>
          <div className="text-lg font-medium text-white">
            {filteredEvents.length}
          </div>
          <div className="text-xs text-slate-500">
            In range
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
            
            {/* Crisis events as reference lines for longer timeframes */}
            {(timeframe === '30d' || timeframe === '1y' || timeframe === 'all') && filteredEvents.map((event, index) => (
              <ReferenceLine
                key={index}
                x={format(event.date, dateRange.formatString)}
                stroke="#EF4444"
                strokeDasharray="4 4"
                label={{ 
                  value: event.title.substring(0, 20) + (event.title.length > 20 ? '...' : ''), 
                  position: 'topLeft', 
                  fontSize: 10,
                  fill: '#EF4444'
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
        <div>
          Confidence interval: ±{((chartData[chartData.length - 1]?.confidence || 0.85) * 10).toFixed(1)} points
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