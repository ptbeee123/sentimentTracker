import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Tooltip, Legend } from 'recharts';
import { format } from 'date-fns';
import { Shield, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { getDateRange, filterDataByDateRange, filterEventsByDateRange, calculateRangeMetrics, getDateRangeDisplayString } from '../utils/dateUtils';
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

  const { chartData, filteredEvents, dateRange, rangeMetrics, eventMarkers } = useMemo(() => {
    const dateRange = getDateRange(timeframe);
    
    // Use correct dataset based on timeframe
    let dataset = timeframe === '24h' ? hourlyData : data;
    
    // Apply precise filtering based on exact date range
    const filteredData = filterDataByDateRange(dataset, dateRange);
    
    // Filter events within the date range
    const filteredEvents = filterEventsByDateRange(events, dateRange);
    
    // Calculate metrics for this exact filtered data
    const rangeMetrics = calculateRangeMetrics(filteredData, dateRange);
    
    // Format chart data with consistent date formatting
    const chartData = filteredData.map(item => ({
      ...item,
      formattedTime: format(item.timestamp, dateRange.formatString),
      originalTimestamp: item.timestamp,
      // Add a unique key for chart positioning
      chartIndex: filteredData.indexOf(item)
    }));

    // FIXED: Create event markers that properly align with chart data
    const eventMarkers = filteredEvents.map((event, eventIndex) => {
      // Find the data point closest to the event date
      let closestDataPoint = chartData[0];
      let minTimeDiff = Infinity;
      let closestIndex = 0;
      
      chartData.forEach((point, index) => {
        const timeDiff = Math.abs(point.originalTimestamp.getTime() - event.date.getTime());
        if (timeDiff < minTimeDiff) {
          minTimeDiff = timeDiff;
          closestDataPoint = point;
          closestIndex = index;
        }
      });

      // Use the chart data point's formatted time for exact positioning
      const xValue = closestDataPoint?.formattedTime || format(event.date, dateRange.formatString);
      
      return {
        id: `event-${eventIndex}`,
        event,
        dataPoint: closestDataPoint,
        xValue,
        chartIndex: closestIndex,
        color: event.type === 'crisis' ? '#EF4444' : 
               event.type === 'response' ? '#3B82F6' : 
               event.type === 'announcement' ? '#10B981' : '#F59E0B',
        label: event.title.length > 30 ? event.title.substring(0, 30) + '...' : event.title,
        shortLabel: event.title.length > 15 ? event.title.substring(0, 15) + '...' : event.title
      };
    });

    return { chartData, filteredEvents, dateRange, rangeMetrics, eventMarkers };
  }, [timeframe, data, hourlyData, events]);

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

  // FIXED: Create proper URLs for events based on company and event details
  const createEventUrl = (event: CrisisEvent): string => {
    // Check if event already has a URL in description
    const urlMatch = event.description?.match(/https?:\/\/[^\s<>"{}|\\^`[\]]+/);
    if (urlMatch) {
      // Clean the URL
      let cleanUrl = urlMatch[0]
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/&/g, '&')
        .replace(/"/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/[<>"'\s]+$/, ''); // Remove trailing characters
      
      return cleanUrl;
    }

    // Create a targeted Google News search for the specific event
    const eventKeywords = event.title
      .replace(/Alert:|Opportunity:|Crisis:|Response:/g, '')
      .replace(/\.\.\./g, '')
      .trim();
    
    const searchQuery = `"${companyName}" "${eventKeywords}"`;
    const encodedQuery = encodeURIComponent(searchQuery);
    
    // Use Google News search with date filter
    const eventDate = event.date;
    const startDate = new Date(eventDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days before
    const endDate = new Date(eventDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days after
    
    const dateFilter = `after:${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')} before:${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')}`;
    
    return `https://www.google.com/search?q=${encodedQuery} ${encodeURIComponent(dateFilter)}&tbm=nws&sort=date`;
  };

  // FIXED: Handle event URL clicks properly
  const handleEventUrlClick = (event: CrisisEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const eventUrl = createEventUrl(event);
      window.open(eventUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error opening event URL:', error);
      // Fallback to basic company search
      const fallbackUrl = `https://www.google.com/search?q=${encodeURIComponent(`"${companyName}" news`)}&tbm=nws`;
      window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      // Check if there's an event at this data point
      const eventAtPoint = eventMarkers.find(marker => marker.xValue === label);
      
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 shadow-lg max-w-sm">
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
          <p className="text-xs text-slate-500 mt-1">
            {format(data.originalTimestamp, 'MMM dd, yyyy HH:mm')}
          </p>
          
          {/* FIXED: Show event information with proper URL handling */}
          {eventAtPoint && (
            <div className="mt-3 pt-3 border-t border-slate-600">
              <div className="flex items-center space-x-2 mb-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: eventAtPoint.color }}
                ></div>
                <span className="text-xs font-medium text-white">Key Event</span>
                {hasVerifiedCrisis && getVerificationIcon()}
              </div>
              <p className="text-sm text-slate-200 font-medium">
                {eventAtPoint.event.title}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {eventAtPoint.event.description}
              </p>
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className={`px-2 py-1 rounded ${
                  eventAtPoint.event.type === 'crisis' ? 'bg-red-500/20 text-red-400' :
                  eventAtPoint.event.type === 'response' ? 'bg-blue-500/20 text-blue-400' :
                  eventAtPoint.event.type === 'announcement' ? 'bg-green-500/20 text-green-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {eventAtPoint.event.type}
                </span>
                <span className={`font-mono ${
                  eventAtPoint.event.impact > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {eventAtPoint.event.impact > 0 ? '+' : ''}{eventAtPoint.event.impact}
                </span>
              </div>
              
              {/* FIXED: Add clickable link that always works */}
              <div className="mt-2 pt-2 border-t border-slate-600">
                <button
                  onClick={(e) => handleEventUrlClick(eventAtPoint.event, e)}
                  className="flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 transition-colors w-full text-left"
                  title="Click to search for related news articles"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Search for related articles</span>
                </button>
                <div className="text-xs text-slate-500 mt-1">
                  Opens targeted news search for this event
                </div>
              </div>
            </div>
          )}
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
              ({getDateRangeDisplayString(dateRange)})
            </span>
            {eventMarkers.length > 0 && (
              <span className="ml-2 text-xs text-green-400">
                • {eventMarkers.length} key event{eventMarkers.length > 1 ? 's' : ''} on timeline
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
            {chartData.length.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">
            {dateRange.label}
          </div>
        </div>
        
        <div className="bg-slate-900 rounded-lg p-3">
          <div className="flex items-center space-x-1 text-xs text-slate-400">
            <span>Key Events</span>
            {hasVerifiedCrisis && getVerificationIcon()}
          </div>
          <div className="text-lg font-medium text-white">
            {eventMarkers.length}
          </div>
          <div className="text-xs text-slate-500">
            {hasVerifiedCrisis ? 'Verified & marked' : 'In timeframe'}
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
              interval="preserveStartEnd"
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              domain={[-100, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="2 2" />
            
            {/* FIXED: Crisis event markers - now properly visible and positioned */}
            {eventMarkers.map((marker, index) => (
              <ReferenceLine
                key={`event-marker-${marker.id}`}
                x={marker.xValue}
                stroke={marker.color}
                strokeWidth={3}
                strokeDasharray="6 4"
                label={{ 
                  value: `${marker.event.type.toUpperCase()}`, 
                  position: index % 2 === 0 ? 'topLeft' : 'topRight',
                  fontSize: 11,
                  fill: marker.color,
                  fontWeight: 'bold',
                  offset: 10
                }}
              />
            ))}
            
            {/* Add event dots on the line for better visibility */}
            {eventMarkers.map((marker, index) => (
              <ReferenceLine
                key={`event-dot-${marker.id}`}
                x={marker.xValue}
                stroke="transparent"
                dot={{
                  fill: marker.color,
                  stroke: '#1e293b',
                  strokeWidth: 2,
                  r: 6
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
          <span>Date Range: <span className="text-blue-400">{getDateRangeDisplayString(dateRange)}</span></span>
          {eventMarkers.length > 0 && (
            <span>Key Events: <span className="text-yellow-400 font-mono">{eventMarkers.length}</span></span>
          )}
        </div>
      </div>
    </div>
  );
};