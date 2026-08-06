import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../common/Logo';

// Custom GitHub SVG Icon to guarantee compile compatibility
function GithubIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 grid gap-12 md:grid-cols-5 text-left select-none">
        <div className="md:col-span-2">
          {/* Logo large version */}
          <Logo size="lg" />
          <p className="mt-4 text-sm text-muted-foreground max-w-sm leading-relaxed">
            The cloud-native learning platform and IDE trusted by universities to teach programming at scale.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <a 
              className="text-muted-foreground hover:text-foreground transition-colors" 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="GitHub Repository"
            >
              <GithubIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
        {[
          { title: 'Product', items: [['/features', 'Features'], ['/pricing', 'Pricing'], ['/docs', 'Docs']] },
          { title: 'Company', items: [['/about', 'About'], ['/contact', 'Contact'], ['/faq', 'FAQ']] },
          { title: 'Legal', items: [['/privacy', 'Privacy'], ['/terms', 'Terms'], ['/security', 'Security']] },
        ].map((col) => (
          <div key={col.title}>
            <div className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              {col.title}
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {col.items.map(([to, label]) => (
                <li key={label}>
                  <Link to={to} className="text-foreground/80 hover:text-foreground transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      {/* Bottom copyrights panel */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} UniCodeIDE. All rights reserved.</span>
          <span className="font-mono text-[10px] bg-muted px-2 py-0.5 rounded border border-border">
            v1.0.0 · production
          </span>
        </div>
      </div>
    </footer>
  );
}
