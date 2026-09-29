import React from 'react';

const DIFFICULTY_STYLES = {
  EASY: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  MEDIUM: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  HARD: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function DifficultyBadge({ difficulty }) {
  const style = DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES.MEDIUM;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${style}`}>
      {difficulty || 'MEDIUM'}
    </span>
  );
}
