import React from 'react';

export function Badge({
  className = '',
  variant = 'default',
  children,
  ...props
}) {
  const baseStyles = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-mono font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none';

  const variants = {
    default: 'border-transparent bg-primary text-primary-foreground shadow',
    secondary: 'border-transparent bg-muted/65 border-border text-muted-foreground',
    outline: 'text-foreground border-border bg-background',
  };

  const classes = `${baseStyles} ${variants[variant] || variants.default} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
