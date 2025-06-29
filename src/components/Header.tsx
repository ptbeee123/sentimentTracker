import React, { useState } from 'react';
import { Building2, Settings, Bell, User, Info } from 'lucide-react';
import { CrisisModal } from './CrisisModal';

interface HeaderProps {
  companyName: string;
  onCompanyChange: (name: string) => void;
  crisisDays: number;
  lastUpdate: Date;
  lastCrisisEvent?: {
    title: string;
    date: Date;
    type: string;
    impact: number;
    description: string;
  };
  allCrisisEvents?: Array<{
    title: string;
    date: Date;
    type: string;
    impact: number;
    description: string;
  }>;
}

export const Header: React.FC<HeaderProps> = ({ 
  companyName, 
  onCompanyChange, 
  crisisDays, 
  lastUpdate,
  lastCrisisEvent,
  allCrisisEvents = []
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(companyName);
  const [showCrisisTooltip, setShowCrisisTooltip] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      onCompanyChange(tempName.trim());
      setIsEditing(false);
    }
  };

  const currentTime = lastUpdate.toLocaleTimeString('en-US', { 
    timeZone: 'America/New_York',
    hour12: false 
  });

  const formatCrisisDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  const handleCrisisDayClick = () => {
    setShowCrisisModal(true);
    setShowCrisisTooltip(false);
  };

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-blue-400" />
              <div>
                <h1 className="text-xl font-light text-white tracking-wide">
                  STRATEGIC SOCIAL SENTIMENT INTELLIGENCE PLATFORM
                </h1>
                <div className="text-xs text-slate-400 mt-1">
                  Enterprise Crisis Recovery | Real-Time Analytics | Data Since Jan 1, 2024
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-slate-300">Company:</label>
              {isEditing ? (
                <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="bg-slate-800 text-white px-3 py-1 rounded border border-slate-600 focus:border-blue-500 focus:outline-none min-w-[200px]"
                    placeholder="Enter company name..."
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="text-green-400 hover:text-green-300 text-sm px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setTempName(companyName);
                    }}
                    className="text-slate-400 hover:text-slate-300 text-sm px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-white font-medium hover:text-blue-400 transition-colors px-3 py-1 rounded hover:bg-slate-800 border border-transparent hover:border-slate-600"
                  title="Click to change company"
                >
                  {companyName}
                </button>
              )}
            </div>

            <div className="text-sm text-slate-300">
              <div className="flex items-center space-x-2">
                <span>Crisis Timeline:</span>
                <div 
                  className="relative"
                  onMouseEnter={() => setShowCrisisTooltip(true)}
                  onMouseLeave={() => setShowCrisisTooltip(false)}
                >
                  <button
                    onClick={handleCrisisDayClick}
                    className="flex items-center space-x-1 cursor-pointer hover:bg-slate-800 px-2 py-1 rounded transition-colors"
                    title="Click for detailed crisis timeline"
                  >
                    <span className={`font-medium ${getCrisisStatusColor(crisisDays)}`}>
                      Day +{crisisDays}
                    </span>
                    <span className="text-slate-400 text-xs">
                      ({getCrisisPhase(crisisDays)})
                    </span>
                    <Info className="h-3 w-3 text-slate-400" />
                  </button>
                  
                  {/* Crisis Details Tooltip */}
                  {showCrisisTooltip && lastCrisisEvent && (
                    <div className="absolute top-full right-0 mt-2 w-80 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50 p-4">
                      <div className="text-xs text-slate-400 mb-1">Last Crisis Event</div>
                      <div className="text-sm font-medium text-white mb-2">
                        {lastCrisisEvent.title}
                      </div>
                      <div className="text-xs text-slate-300 mb-2">
                        {lastCrisisEvent.description}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="text-slate-400">
                          {formatCrisisDate(lastCrisisEvent.date)}
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded ${
                            lastCrisisEvent.type === 'crisis' ? 'bg-red-500/20 text-red-400' :
                            lastCrisisEvent.type === 'response' ? 'bg-blue-500/20 text-blue-400' :
                            lastCrisisEvent.type === 'announcement' ? 'bg-green-500/20 text-green-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {lastCrisisEvent.type}
                          </span>
                          <span className={`font-mono ${
                            lastCrisisEvent.impact > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {lastCrisisEvent.impact > 0 ? '+' : ''}{lastCrisisEvent.impact}
                          </span>
                        </div>
                      </div>
                      
                      {/* Timeline Progress Bar */}
                      <div className="mt-3 pt-3 border-t border-slate-700">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                          <span>Recovery Progress</span>
                          <span>{Math.min(100, Math.round((crisisDays / 90) * 100))}%</span>
                        </div>
                        <div className="bg-slate-700 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              crisisDays < 30 ? 'bg-red-400' :
                              crisisDays < 60 ? 'bg-orange-400' :
                              crisisDays < 90 ? 'bg-yellow-400' :
                              'bg-green-400'
                            }`}
                            style={{ width: `${Math.min(100, (crisisDays / 90) * 100)}%` }}
                          />
                        </div>
                        <div className="text-xs text-slate-500 mt-1 text-center">
                          Click for detailed timeline
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>Last Updated: <span className="text-green-400 font-mono">{currentTime} EST</span></div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-slate-400 hover:text-white transition-colors relative rounded hover:bg-slate-700">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {Math.floor(Math.random() * 5) + 1}
                </span>
              </button>
              <button className="p-2 text-slate-400 hover:text-white transition-colors rounded hover:bg-slate-700">
                <Settings className="h-5 w-5" />
              </button>
              <button className="p-2 text-slate-400 hover:text-white transition-colors rounded hover:bg-slate-700">
                <User className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Crisis Modal */}
      <CrisisModal
        isOpen={showCrisisModal}
        onClose={() => setShowCrisisModal(false)}
        companyName={companyName}
        crisisDays={crisisDays}
        lastCrisisEvent={lastCrisisEvent}
        allCrisisEvents={allCrisisEvents}
      />
    </>
  );
};