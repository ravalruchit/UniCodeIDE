import React from 'react';
import { StaticPage } from '../../components/ui/StaticPage';

export default function FAQ() {
  const faqs = [
    ['Do you support proctored exams?', 'Yes. Teachers can start a monitored exam session, view live coding activity per student, and lock late submissions automatically.'],
    ['Which languages are supported?', 'Python, JavaScript, TypeScript, Java, C, C++, C#, Go, Rust, Ruby, PHP, Swift, Kotlin, Bash — plus 25+ more via our Piston-powered execution grid.'],
    ['Can we bring our own SSO?', 'On the Enterprise plan, we integrate with SAML, OpenID Connect and Google/Microsoft directory services.'],
    ['How is student data isolated?', 'Every university is a fully isolated tenant. Data is namespaced at the database level and access is enforced at every endpoint.'],
    ['Is there a free plan for pilots?', 'Yes — start free with up to 30 students in one classroom. No credit card required.'],
  ];

  return (
    <StaticPage 
      eyebrow="FAQ" 
      title="Frequently asked questions." 
      description="Everything faculty and IT teams ask before signing."
    >
      <div className="not-prose divide-y divide-border border border-border rounded-lg mt-4 text-left overflow-hidden bg-background">
        {faqs.map(([q, a]) => (
          <details key={q} className="group px-5 py-4 transition-colors hover:bg-muted/10">
            <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-foreground select-none">
              <span>{q}</span>
              <span className="text-muted-foreground group-open:rotate-45 transition-transform text-lg leading-none">+</span>
            </summary>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{a}</p>
          </details>
        ))}
      </div>
    </StaticPage>
  );
}
