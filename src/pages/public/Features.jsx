import React from 'react';
import { StaticPage } from '../../components/ui/StaticPage';

export default function Features() {
  const items = [
    ['Cloud IDE', 'Monaco editor, resizable panels, multi-file projects, 40+ language runtimes.'],
    ['Learning Management', 'Courses, lessons, videos, materials, structured curriculum tracks.'],
    ['Assignments', 'Configurable deadlines, starter code, test-based auto-grading and instructor feedback.'],
    ['Coding Exams', 'Timed exams with auto-submit, teacher monitoring dashboard and audit trails.'],
    ['Coding Labs', 'Hands-on practice environments with saved history and shareable snapshots.'],
    ['Progress & Certificates', 'Every student gets a verifiable, shareable certificate on completion.'],
    ['Reports', 'Cohort analytics, exam heatmaps, department- and university-level rollups.'],
    ['Announcements', 'Push messages to any audience: students, teachers, or the entire university.'],
    ['Multi-tenant', 'Isolated tenancy for every university with SSO-ready authentication.'],
  ];

  return (
    <StaticPage 
      eyebrow="Features" 
      title="Every feature your CS program needs — under one login." 
      description="An exhaustive list of what ships in the box."
    >
      <div className="not-prose grid gap-px bg-border border border-border rounded-lg overflow-hidden md:grid-cols-2 mt-4">
        {items.map(([t, d]) => (
          <div key={t} className="bg-background p-5">
            <div className="font-semibold text-foreground">{t}</div>
            <div className="mt-1 text-sm text-muted-foreground">{d}</div>
          </div>
        ))}
      </div>
    </StaticPage>
  );
}
