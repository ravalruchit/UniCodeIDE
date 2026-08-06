import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal } from 'lucide-react';

export function Logo({ size = 'default' }) {
  const isLg = size === 'lg';

  return (
    <Link to="/" className="flex items-center space-x-2 select-none group">
      <div className={`flex items-center justify-center rounded bg-[#86efac] text-zinc-950 font-black shadow-sm transition-transform group-hover:scale-105 ${
        isLg ? 'h-9 w-9' : 'h-8 w-8'
      }`}>
        <Terminal className={`${isLg ? 'h-5 w-5' : 'h-4.5 w-4.5'} stroke-[2.5]`} />
      </div>
      <span className={`font-medium tracking-tight text-foreground transition-colors group-hover:text-primary ${
        isLg ? 'text-xl' : 'text-base'
      }`}>
        UniCode<span className="font-bold">IDE</span>
      </span>
    </Link>
  );
}
