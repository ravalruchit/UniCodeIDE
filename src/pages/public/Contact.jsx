import React from 'react';
import { StaticPage } from '../../components/ui/StaticPage';

export default function Contact() {
  return (
    <StaticPage
      eyebrow="Contact"
      title="Talk to our team."
      description="We usually reply within a business day. For urgent issues, university admins can also use the in-app support portal."
    >
      <div className="not-prose grid gap-4 sm:grid-cols-2 mt-6">
        {[
          ['Sales', 'sales@unicodeide.example', 'For plans, pilots and university-wide rollouts'],
          ['Support', 'support@unicodeide.example', 'Existing customers — 24/7 email support'],
          ['Security', 'security@unicodeide.example', 'Report a vulnerability or request a SOC report'],
          ['Press', 'press@unicodeide.example', 'Media & partnership enquiries'],
        ].map(([t, e, d]) => (
          <div key={t} className="border border-border rounded-lg p-5 bg-card text-card-foreground">
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{t}</div>
            <div className="mt-2 font-mono text-sm text-foreground select-all">{e}</div>
            <div className="mt-1 text-sm text-muted-foreground">{d}</div>
          </div>
        ))}
      </div>
    </StaticPage>
  );
}
