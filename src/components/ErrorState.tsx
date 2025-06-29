import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  errors?: string[];
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  message = 'Metrics not available', 
  errors = [] 
}) => {
  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-red-500/30 min-h-[200px]">
      <div className="text-center">
        <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-400 mb-2">{message}</h3>
        {errors.length > 0 && (
          <div className="text-left">
            <p className="text-sm text-slate-300 mb-2">Issues detected:</p>
            <ul className="text-sm text-slate-400 space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};