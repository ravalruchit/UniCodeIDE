import React from 'react';
import { Code2 } from 'lucide-react';

const LANGUAGE_LABELS = {
  PYTHON: 'Python 3',
  JAVASCRIPT: 'JavaScript (Node)',
  TYPESCRIPT: 'TypeScript',
  JAVA: 'Java 21',
  CPP: 'C++ 20',
  C: 'C17',
};

export function LanguageBadge({ language }) {
  const label = LANGUAGE_LABELS[language] || language || 'Python';

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-muted border border-border text-foreground">
      <Code2 className="w-3 h-3 text-primary" />
      <span>{label}</span>
    </span>
  );
}
