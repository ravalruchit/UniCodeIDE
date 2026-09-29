import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Inbox } from 'lucide-react';

export function EmptyState({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There are no active records in this category yet.',
  actionLabel,
  onAction,
}) {
  return (
    <Card className="py-12 px-6 border border-border border-dashed bg-card/40 text-center select-none">
      <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
      {actionLabel && (
        <div className="mt-5">
          <Button size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </Card>
  );
}
