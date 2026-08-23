import React from 'react';

interface LoaderProps {
  /** 'page' = full-area centered loader, 'inline' = small inline spinner, 'skeleton' = table skeleton rows */
  variant?: 'page' | 'inline' | 'skeleton';
  /** Text shown below the spinner for the 'page' variant */
  text?: string;
  /** Number of skeleton rows for the 'skeleton' variant */
  rows?: number;
  /** Number of skeleton columns for the 'skeleton' variant */
  cols?: number;
}

const Loader: React.FC<LoaderProps> = ({
  variant = 'page',
  text = 'Loading...',
  rows = 5,
  cols = 4,
}) => {
  if (variant === 'inline') {
    return (
      <div className="inline-flex items-center gap-2">
        <svg
          className="animate-spin h-4 w-4 text-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
        {/* Skeleton header row */}
        <div className="bg-slate-50/80 border-b border-slate-100 px-6 py-4 flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <div
              key={i}
              className="h-3 rounded-full flex-1"
              style={{
                background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
                backgroundSize: '200% 100%',
                animation: `shimmer 1.5s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
        {/* Skeleton body rows */}
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div
            key={rowIdx}
            className="px-6 py-4 flex gap-4 border-b border-slate-50 last:border-b-0"
          >
            {Array.from({ length: cols }).map((_, colIdx) => (
              <div
                key={colIdx}
                className="h-3 rounded-full flex-1"
                style={{
                  background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
                  backgroundSize: '200% 100%',
                  animation: `shimmer 1.5s ease-in-out infinite`,
                  animationDelay: `${(rowIdx + colIdx) * 0.08}s`,
                  maxWidth: colIdx === 0 ? '60%' : colIdx === cols - 1 ? '40%' : '80%',
                }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Default: 'page' variant – a centered beautiful loader
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      {/* Animated gradient spinner */}
      <div className="relative w-14 h-14">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0%, #6366f1 50%, transparent 100%)',
            animation: 'spin-slow 1s linear infinite',
          }}
        />
        <div className="absolute inset-[3px] rounded-full bg-slate-50" />
        <div
          className="absolute inset-[3px] rounded-full"
          style={{
            background: 'conic-gradient(from 180deg, transparent 0%, #8b5cf6 50%, transparent 100%)',
            animation: 'spin-slow 1.5s linear infinite reverse',
            opacity: 0.4,
          }}
        />
        <div className="absolute inset-[6px] rounded-full bg-slate-50" />
      </div>
      {text && (
        <p className="mt-5 text-sm font-medium text-slate-400 tracking-wide">{text}</p>
      )}
    </div>
  );
};

export default Loader;
