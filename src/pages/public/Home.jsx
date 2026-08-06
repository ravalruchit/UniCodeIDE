import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Terminal, GraduationCap, Shield, Zap, BookOpen,
  Play, CheckCircle2, Sparkles, LineChart, Lock, FileCode, RefreshCw, Folder
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const UNIS = ['MERIDIAN', 'STANFORD-X', 'IIT DELHI', 'ETH ZÜRICH', 'MIT LABS', 'UCLA'];

const FEATURES = [
  { icon: Terminal, title: 'Cloud IDE', desc: 'Monaco editor with multi-file projects, tabs, resizable panels and 40+ languages powered by our secure execution grid.' },
  { icon: GraduationCap, title: 'Integrated LMS', desc: 'Courses, lessons, video material, assignments, exams and certificates — everything a CS department needs, unified.' },
  { icon: Shield, title: 'Proctored Exams', desc: 'Timed coding exams with auto-submit, live teacher monitoring and audit trails your accreditation team will love.' },
  { icon: Zap, title: 'Auto-grading', desc: 'Deterministic test-runners score submissions in milliseconds and provide instant, structured feedback to students.' },
  { icon: LineChart, title: 'Analytics', desc: 'Cohort progression, engagement funnels, exam heatmaps and exportable reports for every stakeholder.' },
  { icon: Lock, title: 'Multi-tenant', desc: 'Every university operates on isolated data with SSO-ready authentication and role-based access controls.' },
];

export default function Home() {
  const [activeFile, setActiveFile] = useState('main.py');
  const [isRunning, setIsRunning] = useState(false);
  const [runOutput, setRunOutput] = useState(false);

  const handleRunCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setRunOutput(true);
    }, 1000);
  };

  return (
    <div className="bg-background text-foreground relative">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Grid pattern backdrop matching user style */}
        <div className="absolute inset-0 grid-pattern opacity-30 [mask-image:radial-gradient(ellipse_at_top,white_20%,transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-24">
          
          {/* Badge */}
          <Badge variant="secondary" className="rounded-full animate-fade-up">
            <Sparkles className="h-3 w-3 mr-1.5 text-primary" /> Now with Piston-powered execution · 40+ languages
          </Badge>

          <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tighter max-w-4xl animate-fade-up-1 text-left">
            Learn. Code. Build.<br />
            <span className="text-primary">All in one place.</span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-2xl animate-fade-up-2 text-left">
            UniCodeIDE is the cloud IDE and learning platform built for universities. Ship real CS curriculum,
            run secure coding exams, and give every student a professional development environment — no installs, no version drift.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3 animate-fade-up-3">
            <Link to="/register">
              <Button size="lg" className="gap-2">
                Get started free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/features">
              <Button size="lg" variant="outline" className="gap-2">
                <Play className="h-4 w-4 fill-current" /> Try the IDE
              </Button>
            </Link>
          </div>

          {/* Interactive IDEMock */}
          <div className="mt-14 animate-fade-up-3">
            <div className="border border-border rounded-xl overflow-hidden bg-background shadow-2xl shadow-primary/5">
              
              {/* Header Bar */}
              <div className="h-9 flex items-center justify-between px-4 border-b border-border bg-muted/40 select-none">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#86efac]/70" />
                  <span className="ml-4 text-xs font-mono text-muted-foreground hidden sm:inline">
                    main.py — CS101 · Assignment 03
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-mono text-muted-foreground">python 3.10</span>
                  <Button
                    onClick={handleRunCode}
                    disabled={isRunning}
                    size="sm"
                    className="font-mono h-7 text-xs py-0 px-2.5"
                  >
                    {isRunning ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <Play className="h-3 w-3 fill-current" />
                    )}
                    <span>{isRunning ? 'Running...' : 'Run'}</span>
                  </Button>
                </div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-[180px_1fr] min-h-[320px]">
                {/* File Navigation Panel */}
                <div className="border-r border-border bg-muted/20 text-xs font-mono py-3 px-3 space-y-1 text-muted-foreground text-left select-none">
                  <div className="text-foreground flex items-center gap-1"><Folder className="h-3.5 w-3.5 text-primary" /> cs101/</div>
                  <div 
                    onClick={() => setActiveFile('main.py')}
                    className={`pl-4 flex items-center gap-1 cursor-pointer hover:text-foreground ${activeFile === 'main.py' ? 'text-foreground font-semibold' : ''}`}
                  >
                    <FileCode className="h-3 w-3 text-amber-500" /> main.py
                  </div>
                  <div 
                    onClick={() => setActiveFile('utils.py')}
                    className={`pl-4 flex items-center gap-1 cursor-pointer hover:text-foreground ${activeFile === 'utils.py' ? 'text-foreground font-semibold' : ''}`}
                  >
                    <FileCode className="h-3 w-3 text-zinc-500" /> utils.py
                  </div>
                  <div 
                    onClick={() => setActiveFile('tests.py')}
                    className={`pl-4 flex items-center gap-1 cursor-pointer hover:text-foreground ${activeFile === 'tests.py' ? 'text-foreground font-semibold' : ''}`}
                  >
                    <FileCode className="h-3 w-3 text-zinc-500" /> tests.py
                  </div>
                  <div className="pt-2 text-foreground flex items-center gap-1"><Folder className="h-3.5 w-3.5 text-zinc-500" /> docs/</div>
                  <div 
                    onClick={() => setActiveFile('README.md')}
                    className={`pl-4 flex items-center gap-1 cursor-pointer hover:text-foreground ${activeFile === 'README.md' ? 'text-foreground font-semibold' : ''}`}
                  >
                    <FileCode className="h-3 w-3 text-zinc-500" /> README.md
                  </div>
                </div>

                {/* Editor Content Area */}
                <div className="font-mono text-[13px] leading-6 p-5 overflow-hidden text-left bg-background">
                  {activeFile === 'main.py' && (
                    <pre className="font-mono">
                      <span className="text-muted-foreground"># Fibonacci sequence · O(n)</span>{'\n'}
                      <span className="text-primary font-semibold">def</span> <span className="text-blue-500 font-semibold">fib</span>(n: <span className="text-primary">int</span>) -{'>'} <span className="text-primary">list</span>:{'\n'}
                      {'    '}a, b, seq = 0, 1, []{'\n'}
                      {'    '}<span className="text-primary font-semibold">for</span> _ <span className="text-primary font-semibold">in</span> <span className="text-blue-500 font-semibold">range</span>(n):{'\n'}
                      {'        '}seq.append(a){'\n'}
                      {'        '}a, b = b, a + b{'\n'}
                      {'    '}<span className="text-primary font-semibold">return</span> seq{'\n\n'}
                      <span className="text-primary font-semibold">print</span>(fib(10)){'\n'}
                    </pre>
                  )}
                  {activeFile === 'utils.py' && (
                    <pre className="font-mono">
                      <span className="text-muted-foreground"># Helper utils for CS101 assignment</span>{'\n'}
                      <span className="text-primary font-semibold">def</span> <span className="text-blue-500 font-semibold">validate_input</span>(n):{'\n'}
                      {'    '}<span className="text-primary font-semibold">return</span> <span className="text-blue-500 font-semibold">isinstance</span>(n, <span className="text-primary font-semibold">int</span>) <span className="text-primary font-semibold">and</span> n &gt; 0{'\n'}
                    </pre>
                  )}
                  {activeFile === 'tests.py' && (
                    <pre className="font-mono">
                      <span className="text-primary font-semibold">from</span> main <span className="text-primary font-semibold">import</span> fib{'\n\n'}
                      <span className="text-primary font-semibold">def</span> <span className="text-blue-500 font-semibold">test_fib</span>():{'\n'}
                      {'    '}<span className="text-primary font-semibold">assert</span> fib(5) == [0, 1, 1, 2, 3]{'\n'}
                      {'    '}<span className="text-primary font-semibold">assert</span> fib(1) == [0]{'\n'}
                    </pre>
                  )}
                  {activeFile === 'README.md' && (
                    <pre className="font-mono text-zinc-400">
                      <span className="text-emerald-500 font-semibold"># Assignment 03 - Fibonacci sequence</span>{'\n\n'}
                      Write a Python function to output the first N fibonacci numbers.
                    </pre>
                  )}
                </div>
              </div>

              {/* Console Output Bar */}
              <div className="border-t border-border bg-muted/30 px-4 py-3 font-mono text-[12px] text-muted-foreground text-left">
                {!isRunning && !runOutput && (
                  <div>
                    <span className="text-primary">$</span> python main.py
                  </div>
                )}
                {isRunning && (
                  <div className="flex items-center gap-2">
                    <span className="text-primary animate-pulse">$</span>
                    <span className="text-primary animate-pulse">Running interpreter...</span>
                  </div>
                )}
                {!isRunning && runOutput && (
                  <div>
                    <span className="text-primary">$</span> python main.py<br />
                    <span className="text-foreground">[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]</span><br />
                    <span className="text-primary">✓</span> All 8 tests passed · 42ms
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Logos Row */}
      <div className="border-y border-border py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground mb-6">
            Trusted by CS departments across four continents
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-6 items-center justify-items-center">
            {UNIS.map((u) => (
              <div key={u} className="font-mono text-xs sm:text-sm tracking-widest text-muted-foreground/70 hover:text-foreground transition-colors cursor-default">{u}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-24">
          <div className="max-w-2xl text-left">
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">The stack</div>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">Everything a modern CS department needs.</h2>
            <p className="mt-4 text-muted-foreground">One integrated platform replaces a dozen tools — from lecture videos to secure code execution to accreditation-ready reports.</p>
          </div>
          <div className="mt-12 grid gap-px bg-border border border-border rounded-lg overflow-hidden md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-background p-6 hover:bg-muted/40 transition-colors text-left">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
                  <h3 className="mt-4 font-medium tracking-tight text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Split Section */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-24 grid gap-12 lg:grid-cols-2 items-center">
          <div className="text-left">
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-primary">For students</div>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">Code on day one. From any laptop.</h2>
            <p className="mt-4 text-muted-foreground">Zero install. Zero setup. Open a browser tab and you're already inside a professional IDE with your assignments, videos, and grades side by side.</p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                'Instant execution in 40+ languages',
                'Auto-saved projects across devices',
                'Certificates for completed courses',
                'Progress tracking and streaks'
              ].map(x => (
                <li key={x} className="flex items-center gap-2 text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-border rounded-xl p-6 bg-muted/20 text-left font-mono">
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">// Assignment · Binary search</div>
            <pre className="font-mono text-[13px] leading-6 text-foreground">
{`def bsearch(arr, x):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == x: return mid
        if arr[mid] < x: lo = mid + 1
        else: hi = mid - 1
    return -1`}
            </pre>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="rounded-md border border-primary/40 bg-primary/10 text-primary px-2 py-0.5 font-mono">PASSED 12/12</span>
              <span className="text-muted-foreground">Runtime · 12ms · Memory · 4.1MB</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-24 grid md:grid-cols-3 gap-8 items-center text-left">
          <div className="md:col-span-2">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">Ready to bring your CS program online?</h2>
            <p className="mt-3 text-muted-foreground">Start with a free classroom of 30 students. Scale to your entire university when you're ready.</p>
          </div>
          <div className="flex gap-3 md:justify-end">
            <Link to="/register">
              <Button size="lg" className="cursor-pointer">Start free trial</Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="cursor-pointer">Talk to sales</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
