import React from 'react';
import { Calendar, Building } from 'lucide-react';

export function DashboardHeader({
  greeting = 'Welcome back',
  userName,
  subtitle,
  institution,
  actions,
}) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between pb-6 mb-8 border-b border-border select-none">
      <div className="text-left space-y-1">
        <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          <span>{today}</span>
          {institution && (
            <>
              <span>•</span>
              <span className="flex items-center space-x-1 text-foreground font-medium">
                <Building className="h-3.5 w-3.5 text-primary" />
                <span>{institution}</span>
              </span>
            </>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {greeting}, <span className="text-primary">{userName || 'User'}</span>
        </h1>

        {subtitle && (
          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
