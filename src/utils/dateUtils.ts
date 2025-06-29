import { format, startOfYear, endOfDay, subDays, subHours, isAfter, isBefore, isWithinInterval } from 'date-fns';

// Date range constants aligned to January 1, 2025
export const DATA_START_DATE = new Date('2025-01-01T00:00:00Z');
export const DATA_END_DATE = new Date(); // Current date

export interface DateRange {
  start: Date;
  end: Date;
  formatString: string;
  label: string;
  totalDays: number;
}

export const getDateRange = (period: '24h' | '7d' | '30d' | '1y' | 'all'): DateRange => {
  const now = new Date();
  
  switch (period) {
    case '24h':
      const start24h = subHours(now, 24);
      return {
        start: start24h,
        end: now,
        formatString: 'HH:mm',
        label: 'Last 24 Hours',
        totalDays: 1
      };
    case '7d':
      const start7d = subDays(now, 7);
      return {
        start: start7d,
        end: now,
        formatString: 'MMM dd',
        label: 'Last 7 Days',
        totalDays: 7
      };
    case '30d':
      const start30d = subDays(now, 30);
      return {
        start: start30d,
        end: now,
        formatString: 'MMM dd',
        label: 'Last 30 Days',
        totalDays: 30
      };
    case '1y':
      const start1y = subDays(now, 365);
      return {
        start: start1y,
        end: now,
        formatString: 'MMM yyyy',
        label: 'Last Year',
        totalDays: 365
      };
    case 'all':
    default:
      const totalDays = Math.ceil((now.getTime() - DATA_START_DATE.getTime()) / (1000 * 60 * 60 * 24));
      return {
        start: DATA_START_DATE,
        end: now,
        formatString: 'MMM dd, yyyy',
        label: 'All Time',
        totalDays
      };
  }
};

export const formatDateForDisplay = (date: Date, formatString: string): string => {
  return format(date, formatString);
};

export const isDateInRange = (date: Date, start: Date, end: Date): boolean => {
  return isWithinInterval(date, { start, end });
};

export const getDaysFromStart = (date: Date = new Date()): number => {
  return Math.floor((date.getTime() - DATA_START_DATE.getTime()) / (1000 * 60 * 60 * 24));
};

export const getDataCollectionStatus = (dateRange?: DateRange) => {
  const range = dateRange || getDateRange('all');
  const currentDate = new Date();
  
  return {
    startDate: range.start,
    endDate: range.end,
    totalDays: range.totalDays,
    isComplete: true,
    lastUpdate: currentDate,
    dataPoints: range.totalDays * 1000, // Estimated data points per day
    label: range.label
  };
};

// Filter data arrays by date range
export const filterDataByDateRange = <T extends { timestamp: Date }>(
  data: T[], 
  dateRange: DateRange
): T[] => {
  return data.filter(item => isDateInRange(item.timestamp, dateRange.start, dateRange.end));
};

// Filter crisis events by date range
export const filterEventsByDateRange = <T extends { date: Date }>(
  events: T[], 
  dateRange: DateRange
): T[] => {
  return events.filter(event => isDateInRange(event.date, dateRange.start, dateRange.end));
};

// Calculate metrics for a specific date range - FIXED: Ensure proper volume calculation
export const calculateRangeMetrics = (
  data: Array<{ timestamp: Date; sentiment: number; volume: number }>,
  dateRange: DateRange
) => {
  // Ensure we're working with filtered data
  const filteredData = data.filter(item => 
    isDateInRange(item.timestamp, dateRange.start, dateRange.end)
  );
  
  if (filteredData.length === 0) {
    return {
      averageSentiment: 0,
      totalVolume: 0,
      dataPoints: 0,
      sentimentTrend: 0,
      volumeTrend: 0
    };
  }

  // Calculate total volume by summing all volume values in the range
  const totalVolume = filteredData.reduce((sum, item) => sum + (item.volume || 0), 0);
  
  // Calculate average sentiment
  const averageSentiment = filteredData.reduce((sum, item) => sum + (item.sentiment || 0), 0) / filteredData.length;
  
  // Calculate trends (compare first half vs second half of range)
  const midPoint = Math.floor(filteredData.length / 2);
  const firstHalf = filteredData.slice(0, midPoint);
  const secondHalf = filteredData.slice(midPoint);
  
  const firstHalfSentiment = firstHalf.length > 0 ? 
    firstHalf.reduce((sum, item) => sum + (item.sentiment || 0), 0) / firstHalf.length : 0;
  const secondHalfSentiment = secondHalf.length > 0 ? 
    secondHalf.reduce((sum, item) => sum + (item.sentiment || 0), 0) / secondHalf.length : 0;
  
  const firstHalfVolume = firstHalf.length > 0 ? 
    firstHalf.reduce((sum, item) => sum + (item.volume || 0), 0) / firstHalf.length : 0;
  const secondHalfVolume = secondHalf.length > 0 ? 
    secondHalf.reduce((sum, item) => sum + (item.volume || 0), 0) / secondHalf.length : 0;
  
  const sentimentTrend = firstHalfSentiment !== 0 ? 
    ((secondHalfSentiment - firstHalfSentiment) / Math.abs(firstHalfSentiment)) * 100 : 0;
  const volumeTrend = firstHalfVolume !== 0 ? 
    ((secondHalfVolume - firstHalfVolume) / firstHalfVolume) * 100 : 0;

  return {
    averageSentiment: Math.round(averageSentiment),
    totalVolume: Math.round(totalVolume), // This is now the actual sum of all volumes in range
    dataPoints: filteredData.length,
    sentimentTrend: Math.round(sentimentTrend * 10) / 10, // Round to 1 decimal
    volumeTrend: Math.round(volumeTrend * 10) / 10
  };
};