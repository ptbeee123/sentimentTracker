import React from 'react';
import { X, Calendar, AlertTriangle, TrendingUp, TrendingDown, Info, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface CrisisEvent {
  title: string;
  date: Date;
  type: string;
  impact: number;
  description: string;
}

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  crisisDays: number;
  lastCrisisEvent?: CrisisEvent;
  allCrisisEvents?: CrisisEvent[];
}

export const CrisisModal: React.FC<CrisisModalProps> = ({
  isOpen,
  onClose,
  companyName,
  crisisDays,
  lastCrisisEvent,
  allCrisisEvents = []
}) => {
  if (!isOpen) return null;

  const formatCrisisDate = (date: Date) => {
    return format(date, 'MMMM dd, yyyy');
  };

  const formatCrisisTime = (date: Date) => {
    return format(date, 'h:mm a');
  };

  const getCrisisStatusColor = (days: number) => {
    if (days < 30) return 'text-red-400';
    if (days < 60) return 'text-orange-400';
    if (days < 90) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getCrisisPhase = (days: number) => {
    if (days < 7) return 'Acute Crisis';
    if (days < 30) return 'Crisis Response';
    if (days < 60) return 'Recovery Phase';
    if (days < 90) return 'Stabilization';
    return 'Post-Crisis';
  };

  const getPhaseDescription = (days: number) => {
    if (days < 7) return 'Immediate crisis management and damage control measures are in effect.';
    if (days < 30) return 'Active crisis response protocols are being implemented with stakeholder communication.';
    if (days < 60) return 'Recovery strategies are being executed with focus on rebuilding trust and operations.';
    if (days < 90) return 'Stabilization efforts are underway with monitoring of key performance indicators.';
    return 'Post-crisis monitoring and continuous improvement processes are in place.';
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'crisis':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'response':
        return <TrendingUp className="h-4 w-4 text-blue-400" />;
      case 'announcement':
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'external':
        return <Info className="h-4 w-4 text-yellow-400" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'crisis':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'response':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'announcement':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'external':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const recoveryProgress = Math.min(100, Math.round((crisisDays / 90) * 100));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-medium text-white">
              {companyName} Crisis Timeline
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Comprehensive crisis recovery analysis and timeline
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors rounded hover:bg-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Crisis Status Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-900 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-5 w-5 text-blue-400" />
                <h3 className="text-sm font-medium text-white">Crisis Timeline</h3>
              </div>
              <div className={`text-2xl font-light ${getCrisisStatusColor(crisisDays)}`}>
                Day +{crisisDays}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {getCrisisPhase(crisisDays)}
              </div>
            </div>

            <div className="bg-slate-900 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <h3 className="text-sm font-medium text-white">Recovery Progress</h3>
              </div>
              <div className="text-2xl font-light text-white">
                {recoveryProgress}%
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Target: 90-day recovery
              </div>
            </div>

            <div className="bg-slate-900 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
                <h3 className="text-sm font-medium text-white">Total Events</h3>
              </div>
              <div className="text-2xl font-light text-white">
                {allCrisisEvents.length}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Crisis-related events
              </div>
            </div>
          </div>

          {/* Recovery Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-white">Recovery Progress</h3>
              <span className="text-sm text-slate-400">{recoveryProgress}% Complete</span>
            </div>
            <div className="bg-slate-700 rounded-full h-3 mb-2">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  crisisDays < 30 ? 'bg-red-400' :
                  crisisDays < 60 ? 'bg-orange-400' :
                  crisisDays < 90 ? 'bg-yellow-400' :
                  'bg-green-400'
                }`}
                style={{ width: `${recoveryProgress}%` }}
              />
            </div>
            <div className="text-sm text-slate-300">
              {getPhaseDescription(crisisDays)}
            </div>
          </div>

          {/* Last Crisis Event Details */}
          {lastCrisisEvent && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-white mb-4">Last Crisis Event</h3>
              <div className="bg-slate-900 rounded-lg p-6 border border-slate-600">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getEventTypeIcon(lastCrisisEvent.type)}
                      <h4 className="text-lg font-medium text-white">
                        {lastCrisisEvent.title}
                      </h4>
                    </div>
                    <p className="text-slate-300 mb-3">
                      {lastCrisisEvent.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded border text-sm font-medium ${getEventTypeColor(lastCrisisEvent.type)}`}>
                      {lastCrisisEvent.type.charAt(0).toUpperCase() + lastCrisisEvent.type.slice(1)}
                    </span>
                    <span className={`text-lg font-mono ${
                      lastCrisisEvent.impact > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {lastCrisisEvent.impact > 0 ? '+' : ''}{lastCrisisEvent.impact}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-slate-400">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatCrisisDate(lastCrisisEvent.date)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatCrisisTime(lastCrisisEvent.date)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>Impact Score:</span>
                    <span className={`font-medium ${
                      lastCrisisEvent.impact > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {lastCrisisEvent.impact > 0 ? '+' : ''}{lastCrisisEvent.impact} points
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Crisis Timeline Events */}
          {allCrisisEvents.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Complete Crisis Timeline</h3>
              <div className="space-y-4">
                {allCrisisEvents
                  .sort((a, b) => b.date.getTime() - a.date.getTime())
                  .map((event, index) => (
                    <div key={index} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          {getEventTypeIcon(event.type)}
                          <div className="flex-1">
                            <h4 className="font-medium text-white mb-1">
                              {event.title}
                            </h4>
                            <p className="text-sm text-slate-300 mb-2">
                              {event.description}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-slate-400">
                              <span>{formatCrisisDate(event.date)}</span>
                              <span>{formatCrisisTime(event.date)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded border text-xs font-medium ${getEventTypeColor(event.type)}`}>
                            {event.type}
                          </span>
                          <span className={`text-sm font-mono ${
                            event.impact > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {event.impact > 0 ? '+' : ''}{event.impact}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Crisis Management Recommendations */}
          <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="h-5 w-5 text-blue-400" />
              <h4 className="text-sm font-medium text-blue-400">Crisis Management Status</h4>
            </div>
            <p className="text-sm text-slate-300">
              {crisisDays < 30 ? (
                `${companyName} is currently in the ${getCrisisPhase(crisisDays).toLowerCase()} phase. Focus on immediate stakeholder communication and damage control measures.`
              ) : crisisDays < 90 ? (
                `${companyName} is progressing through the ${getCrisisPhase(crisisDays).toLowerCase()}. Continue implementing recovery strategies and monitoring key metrics.`
              ) : (
                `${companyName} has successfully navigated the crisis recovery period. Maintain vigilance and continue post-crisis monitoring protocols.`
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};