import React from 'react';
import { StaticPage } from '../../components/ui/StaticPage';

export default function Docs() {
  const docsList = [
    'Quickstart for administrators',
    'Onboarding students',
    'Authoring courses & lessons',
    'Designing coding assignments',
    'Running secure exams',
    'Configuring auto-grading',
    'SSO & SAML integration',
    'REST API reference',
    'Webhooks & integrations',
    'Data export & compliance'
  ];

  return (
    <StaticPage 
      eyebrow="Documentation" 
      title="Docs & guides." 
      description="Everything from admin setup to writing custom auto-graders."
    >
      <ul className="not-prose grid gap-3 sm:grid-cols-2 mt-4 text-left">
        {docsList.map((t) => (
          <li 
            key={t} 
            className="border border-border rounded-lg p-4 hover:bg-muted/40 transition-all cursor-pointer bg-background"
          >
            <div className="font-semibold text-sm text-foreground">{t}</div>
            <div className="text-xs text-muted-foreground mt-1 font-mono">
              docs/{t.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
            </div>
          </li>
        ))}
      </ul>
    </StaticPage>
  );
}
