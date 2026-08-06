import React from 'react';
import { StaticPage } from '../../components/ui/StaticPage';

export default function Pricing() {
  const tiers = [
    { name: 'Starter', price: 'Free', desc: 'For one classroom.', items: ['30 students', 'Cloud IDE', 'Basic LMS', 'Email support'], cta: 'Start free' },
    { name: 'Professional', price: '$4', unit: 'student / month', desc: 'For departments.', items: ['Unlimited courses', 'Coding exams', 'Auto-grading', 'Priority support'], cta: 'Book a pilot', featured: true },
    { name: 'Enterprise', price: 'Custom', desc: 'For universities.', items: ['SSO / SAML', 'Isolated tenancy', 'Custom SLAs', 'Dedicated CSM'], cta: 'Talk to sales' },
  ];

  return (
    <StaticPage 
      eyebrow="Pricing" 
      title="Simple pricing. Priced per active student." 
      description="Every plan includes the full IDE, LMS, exams and analytics."
    >
      <div className="not-prose grid gap-4 md:grid-cols-3 mt-4 text-left">
        {tiers.map((t) => (
          <div 
            key={t.name} 
            className={`rounded-lg border p-6 flex flex-col ${
              t.featured ? 'border-primary bg-muted/30' : 'border-border bg-background'
            }`}
          >
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{t.name}</div>
            <div className="mt-3 text-4xl font-semibold tracking-tighter text-foreground">
              {t.price}
              {t.unit && <span className="text-sm text-muted-foreground font-normal ml-1">{t.unit}</span>}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{t.desc}</div>
            <ul className="mt-6 space-y-2 text-sm flex-1 text-muted-foreground">
              {t.items.map((it) => (
                <li key={it}>· {it}</li>
              ))}
            </ul>
            <a 
              href="/contact" 
              className={`mt-6 inline-flex justify-center items-center rounded-md h-10 px-4 text-sm font-semibold transition-all ${
                t.featured 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/95 shadow' 
                  : 'border border-border bg-background hover:bg-secondary text-foreground'
              }`}
            >
              {t.cta}
            </a>
          </div>
        ))}
      </div>
    </StaticPage>
  );
}
