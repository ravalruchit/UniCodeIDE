import React from 'react';
import { Card } from '../ui/Card';
import { Clock } from 'lucide-react';

export function RecentActivity({ title = 'Recent Activity', activities = [] }) {
  return (
    <Card className="p-5 border border-border bg-card text-left">
      <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-primary" />
          <span>{title}</span>
        </h3>
        <span className="text-[11px] text-muted-foreground font-mono">Live audit trail</span>
      </div>

      {activities.length === 0 ? (
        <div className="py-8 text-center text-xs text-muted-foreground">
          No recent activity logged in this session yet.
        </div>
      ) : (
        <div className="divide-y divide-border/60">
          {activities.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="py-3 flex items-start space-x-3 first:pt-0 last:pb-0">
                {Icon && (
                  <div className="h-7 w-7 rounded bg-muted/60 text-primary flex items-center justify-center shrink-0 mt-0.5 border border-border/50">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">{item.description}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                    <span>{item.time}</span>
                    {item.meta && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-primary/80">{item.meta}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
