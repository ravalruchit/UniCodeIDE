import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

function ErrorLayout({ code, title, desc, cta = 'Go home', to = '/' }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      {/* Decorative subtle grid background matching hero */}
      <div className="absolute inset-0 grid-pattern opacity-10 [mask-image:radial-gradient(ellipse_at_center,white_20%,transparent_80%)] -z-10" />
      
      <div className="max-w-md text-center animate-fade-up">
        {/* Code display */}
        <div className="font-mono text-6xl sm:text-7xl font-semibold tracking-tighter text-primary">
          {code}
        </div>
        {/* Title */}
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {/* Description */}
        <p className="mt-2 text-sm text-muted-foreground">
          {desc}
        </p>
        {/* Reusable Button */}
        <Link to={to}>
          <Button className="mt-6">
            {cta}
          </Button>
        </Link>
      </div>
    </div>
  );
}

export const NotFound = () => (
  <ErrorLayout 
    code="404" 
    title="Page not found" 
    desc="The page you're looking for doesn't exist or has been moved." 
  />
);

export const ServerError = () => (
  <ErrorLayout 
    code="500" 
    title="Something broke on our end" 
    desc="Our engineers have been notified. Try again in a moment." 
  />
);

export const Unauthorized = () => (
  <ErrorLayout 
    code="403" 
    title="Access denied" 
    desc="You don't have permission to view this resource." 
    cta="Sign in" 
    to="/login" 
  />
);

export default NotFound;
