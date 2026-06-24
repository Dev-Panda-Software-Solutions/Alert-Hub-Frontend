import React from 'react';

interface StatusDotProps {
  completed: boolean;
  overdue?: boolean;
  dueDate?: string;
}

const StatusDot: React.FC<StatusDotProps> = ({ completed, overdue, dueDate }) => {
  const isOverdue = overdue ?? (dueDate ? dueDate < new Date().toISOString().split('T')[0] : false);
  const color = completed
    ? 'bg-emerald-400'
    : isOverdue
    ? 'bg-red-400 animate-pulse'
    : 'bg-amber-400';

  return <span className={`inline-block w-2 h-2 rounded-full ${color}`} />;
};

export default StatusDot;
