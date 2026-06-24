import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullPage?: boolean;
}

const SIZE = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text, fullPage }) => {
  const inner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${SIZE[size]} border-slate-200 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin`}
        style={{ border: '3px solid', borderTopColor: 'rgb(59 130 246)' }}
      />
      {text && <p className="text-sm text-slate-500 dark:text-slate-400">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-slate-950 flex items-center justify-center z-50">
        {inner}
      </div>
    );
  }

  return inner;
};

export default LoadingSpinner;
