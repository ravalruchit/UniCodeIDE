import React from 'react';
import { Card } from '../ui/Card';
import { ArrowUpRight } from 'lucide-react';

export function QuickActions({ actions = [] }) {
  if (!actions || actions.length === 0) return null;

  return (
    <div className="space-y-3 text-left">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
          Quick Actions
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Card
              key={act.title}
              onClick={act.onClick}
              className="p-4 border border-border bg-card/60 hover:bg-accent/60 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icon className="h-4 w-4" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-primary transition-colors" />
              </div>
              <div>
                <div className="font-semibold text-sm text-foreground">{act.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{act.description}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
