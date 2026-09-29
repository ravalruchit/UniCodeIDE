import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { BarChart3, TrendingUp, Cpu, Server, Activity, Users, Download } from 'lucide-react';

export default function SuperAdminAnalyticsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2 sm:p-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span>Platform Telemetry & Global Analytics</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time code execution load, Docker container orchestration metrics, and multi-tenant resource consumption.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="gap-2"
          onClick={() => alert('Global telemetry exported (JSON format).')}
        >
          <Download className="h-4 w-4" />
          <span>Export Metrics</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Global Code Runs (24h)</div>
          <div className="text-2xl font-bold font-mono text-primary mt-1">84,210</div>
          <div className="text-[11px] text-emerald-500 mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> +14.2% peak surge
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Active Piston Runtimes</div>
          <div className="text-2xl font-bold font-mono text-foreground mt-1">16 Nodes</div>
          <div className="text-[11px] text-muted-foreground mt-1">Auto-scaled Kubernetes pods</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Median Execution Duration</div>
          <div className="text-2xl font-bold font-mono text-emerald-500 mt-1">320 ms</div>
          <div className="text-[11px] text-muted-foreground mt-1">Target SLA &lt; 800ms</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Multi-Device Cloud Syncs</div>
          <div className="text-2xl font-bold font-mono text-blue-500 mt-1">214,800</div>
          <div className="text-[11px] text-muted-foreground mt-1">Phase 6 sync delta engine</div>
        </Card>
      </div>

      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider font-mono">
          Language Execution Distribution
        </h3>
        <div className="space-y-3">
          {[
            { lang: 'Python 3.10', pct: 54, runs: '45,473 runs' },
            { lang: 'C++ 17 (GCC)', pct: 26, runs: '21,894 runs' },
            { lang: 'JavaScript / Node.js 18', pct: 14, runs: '11,789 runs' },
            { lang: 'Java 17 OpenJDK', pct: 6, runs: '5,054 runs' },
          ].map((item) => (
            <div key={item.lang} className="space-y-1 text-xs">
              <div className="flex justify-between font-medium">
                <span className="text-foreground">{item.lang}</span>
                <span className="text-muted-foreground font-mono">{item.pct}% ({item.runs})</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
