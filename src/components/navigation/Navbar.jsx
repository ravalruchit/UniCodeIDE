import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Logo } from '../common/Logo';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '../ui/Button';

// Test IDs matching the constants in your shared snippet
const NAV = {
  linkFeatures: 'link-features',
  linkPricing: 'link-pricing',
  linkDocs: 'link-docs',
  linkAbout: 'link-about',
  linkFaq: 'link-faq',
  linkContact: 'link-contact',
  login: 'btn-login',
  signup: 'btn-signup',
  mobileToggle: 'btn-mobile-toggle'
};

const links = [
  { to: '/features', label: 'Features', id: NAV.linkFeatures },
  { to: '/pricing', label: 'Pricing', id: NAV.linkPricing },
  { to: '/docs', label: 'Docs', id: NAV.linkDocs },
  { to: '/about', label: 'About', id: NAV.linkAbout },
  { to: '/faq', label: 'FAQ', id: NAV.linkFaq },
  { to: '/contact', label: 'Contact', id: NAV.linkContact },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                data-testid={l.id}
                className={`transition-colors hover:text-foreground ${
                  pathname === l.to ? 'text-foreground font-medium' : 'text-muted-foreground'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/login" className="hidden sm:inline-flex">
            <Button variant="ghost" size="sm" data-testid={NAV.login}>
              Log in
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm" data-testid={NAV.signup} className="gap-2">
              Get started <span className="hidden sm:inline">→</span>
            </Button>
          </Link>
          <button
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground hover:bg-accent cursor-pointer"
            onClick={() => setOpen((v) => !v)}
            data-testid={NAV.mobileToggle}
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-2 text-left">
            {links.map((l) => (
              <Link 
                key={l.to} 
                to={l.to} 
                onClick={() => setOpen(false)} 
                className="py-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
