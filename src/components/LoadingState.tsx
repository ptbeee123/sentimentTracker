import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading metrics...' }) => {
  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 flex items-center justify-center min-h-[200px]">
      <div className="text-center">
        <Loader2 className="h-8 w-8 text-blue-400 animate-spin mx-auto mb-4" />
        <p className="text-slate-300">{message}</p>
      </div>
    </div>
  );
};