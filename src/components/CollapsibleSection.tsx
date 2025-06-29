import React from 'react';
import { ChevronDown, ChevronUp, Minimize2, Maximize2 } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  subtitle,
  isExpanded,
  onToggle,
  children,
  className = ''
}) => {
  return (
    <div className={`bg-slate-800 rounded-lg border border-slate-700 ${className}`}>
      {/* Section Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-750 transition-colors border-b border-slate-700"
        onClick={onToggle}
      >
        <div className="flex-1">
          <h2 className="text-lg font-medium text-white">{title}</h2>
          {subtitle && (
            <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Expand/Collapse Status */}
          <div className="flex items-center space-x-1 text-xs text-slate-500">
            {isExpanded ? (
              <>
                <Minimize2 className="h-3 w-3" />
                <span>Click to collapse</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3 w-3" />
                <span>Click to expand</span>
              </>
            )}
          </div>
          
          {/* Toggle Button */}
          <button
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
            title={isExpanded ? 'Collapse section' : 'Expand section'}
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      
      {/* Section Content */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isExpanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'
      }`}>
        {isExpanded && (
          <div className="p-6">
            {children}
          </div>
        )}
      </div>
      
      {/* Collapsed State Indicator */}
      {!isExpanded && (
        <div className="p-4 text-center">
          <div className="text-sm text-slate-500">
            Section collapsed - click header to expand
          </div>
          <div className="mt-2 flex justify-center space-x-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-1 h-1 bg-slate-600 rounded-full"></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};