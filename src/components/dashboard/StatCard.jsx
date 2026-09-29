import React from 'react';
import { Card } from '../ui/Card';

export function StatCard({
  title,
  value,
  subvalue,
  icon: Icon,
  trend,
  trendType = 'positive', // 'positive' | 'negative' | 'neutral'
  badge,
}) {
  const trendColor =
    trendType === 'positive'
      ? 'text-emerald-500'
      : trendType === 'negative'
      ? 'text-rose-500'
      : 'text-muted-foreground';

  return (
    <Card className="p-5 border border-border bg-card hover:bg-muted/10 transition-colors text-left select-none shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
          {title}
        </span>
        {Icon && (
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline space-x-2">
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
          {value}
        </div>
        {subvalue && (
          <span className="text-xs text-muted-foreground font-mono">
            {subvalue}
          </span>
        )}
      </div>

      {(trend || badge) && (
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
          {trend && <span className={`font-mono ${trendColor}`}>{trend}</span>}
          {badge && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-border bg-muted/40 text-muted-foreground ml-auto">
              {badge}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
