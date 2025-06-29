import React, { useEffect, useState } from 'react';
import { Bot, Activity, CheckCircle, AlertCircle, Clock, Database, Zap } from 'lucide-react';
import { AgentSwarm, DataAgent } from '../types/agents';
import { agentSwarmService } from '../services/agentSwarm';

interface AgentSwarmMonitorProps {
  companyName: string;
  onCollectionComplete: () => void;
}

export const AgentSwarmMonitor: React.FC<AgentSwarmMonitorProps> = ({ 
  companyName, 
  onCollectionComplete 
}) => {
  const [swarm, setSwarm] = useState<AgentSwarm | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [realTimeUpdates, setRealTimeUpdates] = useState<string[]>([]);

  useEffect(() => {
    const initializeAndStart = async () => {
      try {
        const newSwarm = await agentSwarmService.initializeSwarm(companyName);
        setSwarm(newSwarm);
        
        // Start collection after brief delay
        setTimeout(() => {
          agentSwarmService.startCollection();
        }, 1000);
        
      } catch (error) {
        console.error('Failed to initialize agent swarm:', error);
      }
    };

    initializeAndStart();

    // Subscribe to swarm updates
    const unsubscribe = agentSwarmService.subscribe((updatedSwarm) => {
      setSwarm(updatedSwarm);
      
      // Add real-time update messages with actual data points
      const activeAgents = updatedSwarm.agents.filter(a => a.status === 'collecting' || a.status === 'processing');
      if (activeAgents.length > 0) {
        const latestAgent = activeAgents[activeAgents.length - 1];
        if (latestAgent.dataPoints > 0) {
          const updateMessage = `${latestAgent.name}: ${latestAgent.dataPoints} data points collected`;
          setRealTimeUpdates(prev => {
            // Avoid duplicate messages
            if (prev[0] !== updateMessage) {
              return [updateMessage, ...prev.slice(0, 9)]; // Keep last 10 updates
            }
            return prev;
          });
        }
      }
      
      // Add completion messages for each agent
      const justCompleted = updatedSwarm.agents.filter(a => a.status === 'completed');
      justCompleted.forEach(agent => {
        const completionMessage = `✅ ${agent.name}: Collection completed (${agent.dataPoints} data points)`;
        setRealTimeUpdates(prev => {
          if (!prev.some(msg => msg.includes(agent.name) && msg.includes('completed'))) {
            return [completionMessage, ...prev.slice(0, 9)];
          }
          return prev;
        });
      });
      
      if (updatedSwarm.status === 'completed') {
        setRealTimeUpdates(prev => [`🎉 Real data collection completed for ${companyName} - ${updatedSwarm.totalDataPoints} total data points`, ...prev.slice(0, 9)]);
        setTimeout(() => {
          setIsVisible(false);
          onCollectionComplete();
        }, 3000); // Show completion for 3 seconds
      }
    });

    return unsubscribe;
  }, [companyName, onCollectionComplete]);

  if (!swarm || !isVisible) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'collecting':
        return <Activity className="h-4 w-4 text-blue-400 animate-pulse" />;
      case 'processing':
        return <Database className="h-4 w-4 text-yellow-400 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'collecting':
        return 'text-blue-400';
      case 'processing':
        return 'text-yellow-400';
      case 'completed':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const formatTimeRemaining = () => {
    if (swarm.status === 'completed') return 'Complete';
    
    const now = new Date();
    const remaining = Math.max(0, swarm.estimatedCompletion.getTime() - now.getTime());
    const seconds = Math.ceil(remaining / 1000);
    
    if (seconds < 60) return `${seconds}s remaining`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s remaining`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center space-x-3 mb-6">
          <Bot className="h-6 w-6 text-blue-400" />
          <div>
            <h2 className="text-xl font-medium text-white">
              Real-Time Agent Swarm Data Collection
            </h2>
            <p className="text-sm text-slate-400">
              Actively collecting live data for <span className="text-blue-400 font-medium">{companyName}</span> from multiple sources
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Overall Progress */}
          <div className="lg:col-span-2">
            {/* Overall Progress */}
            <div className="mb-6 bg-slate-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">Overall Progress</span>
                <span className="text-sm text-slate-400">{formatTimeRemaining()}</span>
              </div>
              <div className="bg-slate-700 rounded-full h-3 mb-2">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${swarm.overallProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{swarm.overallProgress}% Complete</span>
                <span>{swarm.totalDataPoints.toLocaleString()} data points collected</span>
              </div>
            </div>

            {/* Collection Parameters */}
            <div className="mb-6 bg-slate-900 rounded-lg p-4">
              <h3 className="text-sm font-medium text-white mb-2">Collection Parameters</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Start Date:</span>
                  <div className="text-white font-mono">
                    {swarm.startDate.toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">End Date:</span>
                  <div className="text-white font-mono">
                    {swarm.endDate.toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Duration:</span>
                  <div className="text-white font-mono">
                    {Math.ceil((swarm.endDate.getTime() - swarm.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {swarm.agents.map((agent) => (
                <div key={agent.id} className="bg-slate-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(agent.status)}
                      <h4 className="font-medium text-white text-sm">{agent.name}</h4>
                    </div>
                    <span className={`text-xs font-medium ${getStatusColor(agent.status)}`}>
                      {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="bg-slate-700 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        agent.status === 'completed' ? 'bg-green-500' :
                        agent.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${agent.progress}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{agent.progress}%</span>
                    <span className="font-mono text-white">{agent.dataPoints.toLocaleString()} points</span>
                  </div>
                  
                  {agent.errors.length > 0 && (
                    <div className="mt-2 text-xs text-orange-400">
                      {agent.errors[agent.errors.length - 1]}
                    </div>
                  )}
                  
                  <div className="mt-2 text-xs text-slate-500">
                    Last update: {agent.lastUpdate.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Real-Time Updates */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-lg p-4 h-full">
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="h-4 w-4 text-yellow-400" />
                <h3 className="text-sm font-medium text-white">Live Data Stream</h3>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {realTimeUpdates.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-6 w-6 text-slate-400 mx-auto mb-2 animate-pulse" />
                    <p className="text-xs text-slate-400">Initializing data collection...</p>
                  </div>
                ) : (
                  realTimeUpdates.map((update, index) => (
                    <div key={index} className="text-xs text-slate-300 p-2 bg-slate-800 rounded border-l-2 border-blue-400">
                      <div className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                        <span>{update}</span>
                      </div>
                      <div className="text-slate-500 mt-1">
                        {new Date().toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* UPDATED: Data Sources Status - Now includes all agents */}
              <div className="mt-4 pt-4 border-t border-slate-700">
                <h4 className="text-xs font-medium text-slate-400 mb-2">Active Sources</h4>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Reddit API</span>
                    <div className={`w-2 h-2 rounded-full ${
                      swarm.agents.find(a => a.id === 'reddit-collector')?.status === 'completed' ? 'bg-green-400' :
                      swarm.agents.find(a => a.id === 'reddit-collector')?.status === 'collecting' ? 'bg-blue-400 animate-pulse' :
                      'bg-slate-500'
                    }`}></div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Google News</span>
                    <div className={`w-2 h-2 rounded-full ${
                      swarm.agents.find(a => a.id === 'news-collector')?.status === 'completed' ? 'bg-green-400' :
                      swarm.agents.find(a => a.id === 'news-collector')?.status === 'collecting' ? 'bg-blue-400 animate-pulse' :
                      'bg-slate-500'
                    }`}></div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">LinkedIn Network</span>
                    <div className={`w-2 h-2 rounded-full ${
                      swarm.agents.find(a => a.id === 'linkedin-collector')?.status === 'completed' ? 'bg-green-400' :
                      swarm.agents.find(a => a.id === 'linkedin-collector')?.status === 'collecting' ? 'bg-blue-400 animate-pulse' :
                      'bg-slate-500'
                    }`}></div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Verified News</span>
                    <div className={`w-2 h-2 rounded-full ${
                      swarm.agents.find(a => a.id === 'verified-news-collector')?.status === 'completed' ? 'bg-green-400' :
                      swarm.agents.find(a => a.id === 'verified-news-collector')?.status === 'collecting' ? 'bg-blue-400 animate-pulse' :
                      'bg-slate-500'
                    }`}></div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Financial APIs</span>
                    <div className={`w-2 h-2 rounded-full ${
                      swarm.agents.find(a => a.id === 'financial-collector')?.status === 'completed' ? 'bg-green-400' :
                      swarm.agents.find(a => a.id === 'financial-collector')?.status === 'collecting' ? 'bg-blue-400 animate-pulse' :
                      'bg-slate-500'
                    }`}></div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Crisis Verifier</span>
                    <div className={`w-2 h-2 rounded-full ${
                      swarm.agents.find(a => a.id === 'crisis-verifier')?.status === 'completed' ? 'bg-green-400' :
                      swarm.agents.find(a => a.id === 'crisis-verifier')?.status === 'collecting' ? 'bg-blue-400 animate-pulse' :
                      'bg-slate-500'
                    }`}></div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Company Events</span>
                    <div className={`w-2 h-2 rounded-full ${
                      swarm.agents.find(a => a.id === 'company-events-collector')?.status === 'completed' ? 'bg-green-400' :
                      swarm.agents.find(a => a.id === 'company-events-collector')?.status === 'collecting' ? 'bg-blue-400 animate-pulse' :
                      'bg-slate-500'
                    }`}></div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Business Validator</span>
                    <div className={`w-2 h-2 rounded-full ${
                      swarm.agents.find(a => a.id === 'validator-agent')?.status === 'completed' ? 'bg-green-400' :
                      swarm.agents.find(a => a.id === 'validator-agent')?.status === 'collecting' ? 'bg-blue-400 animate-pulse' :
                      'bg-slate-500'
                    }`}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {swarm.status === 'completed' && (
          <div className="mt-6 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-green-400 font-medium">
                Real-time data collection completed successfully!
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-1">
              Collected {swarm.totalDataPoints.toLocaleString()} data points from {swarm.startDate.toLocaleDateString()} to {swarm.endDate.toLocaleDateString()}. 
              Dashboard will update with live data in 3 seconds...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};