import React from 'react';
import type { ConnectionStatus } from '../../types';

interface StatusBadgeProps {
  status: ConnectionStatus;
  isOnline?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, isOnline = true }) => {
  if (!isOnline) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-medium text-slate-400">
        <span className="status-dot disconnected" />
        <span>Offline Mode</span>
      </div>
    );
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'CONNECTED':
        return { label: 'FastAPI Live', class: 'connected', color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/50' };
      case 'CONNECTING':
        return { label: 'Connecting...', class: 'connecting', color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-800/50' };
      case 'RECONNECTING':
        return { label: 'Reconnecting...', class: 'connecting', color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-800/50' };
      case 'MOCK_MODE':
        return { label: 'Mock Engine Active', class: 'mock', color: 'text-purple-400', bg: 'bg-purple-950/40 border-purple-800/50' };
      case 'DISCONNECTED':
      default:
        return { label: 'Disconnected', class: 'disconnected', color: 'text-rose-400', bg: 'bg-rose-950/40 border-rose-800/50' };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-md transition-all ${config.bg}`}>
      <span className={`status-dot ${config.class}`} />
      <span className={config.color}>{config.label}</span>
    </div>
  );
};
