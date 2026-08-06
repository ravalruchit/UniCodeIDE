import React from 'react';
import { PageHeader } from './PageHeader';

export function StaticPage({ eyebrow, title, description, children }) {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 text-left">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="prose prose-neutral dark:prose-invert max-w-none text-foreground/90 leading-relaxed font-sans">
        {children}
      </div>
    </div>
  );
}
