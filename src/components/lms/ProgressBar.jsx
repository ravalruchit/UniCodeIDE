import React from 'react';

export function ProgressBar({
  value = 0,
  max = 100,
  showLabel = true,
  size = 'md',
  color = 'primary',
  className = '',
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  }[size] || 'h-2';

  const colorClasses = {
    primary: 'bg-primary',
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
  }[color] || 'bg-primary';

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-medium text-muted-foreground">Course Completion</span>
          <span className="font-mono font-semibold text-foreground">{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-muted/70 rounded-full overflow-hidden ${sizeClasses}`}>
        <div
          className={`${sizeClasses} ${colorClasses} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
