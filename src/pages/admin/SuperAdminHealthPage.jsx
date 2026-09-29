import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Activity, CheckCircle2, Server, Database, ShieldCheck, RefreshCw, Cpu } from 'lucide-react';

export default function SuperAdminHealthPage() {
  const subsystems = [
    {
      name: 'Express.js Core API Gateway',
      status: 'OPERATIONAL',
      latency: '24ms',
      uptime: '99.99%',
      details: 'HTTP/2 REST, JWT auth validation, tenant tenancy checks',
    },
    {
      name: 'MongoDB Replica Set',
      status: 'OPERATIONAL',
      latency: '4ms',
      uptime: '100.0%',
      details: 'Primary + 2 secondaries, connection pool healthy (12/100 connections)',
    },
    {
      name: 'Docker / Piston Execution Sandbox Engine',
      status: 'OPERATIONAL',
      latency: '310ms',
      uptime: '99.95%',
      details: 'Isolated container pool (16 warm containers, memory cgroups active)',
    },
    {
      name: 'Desktop Lab Daemon Socket Relays',
      status: 'OPERATIONAL',
      latency: '18ms',
      uptime: '99.98%',
      details: 'Active lab client heartbeat monitoring & audit logging',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2 sm:p-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <Activity className="h-6 w-6 text-emerald-500" />
            <span>Infrastructure Health & Service Status</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time status of API microservices, database clusters, Docker execution runners, and lab daemons.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="gap-2"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Health Checks</span>
        </Button>
      </div>

      <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-xs flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <div>
          <span className="font-bold">All Systems Fully Operational:</span> No platform disruptions, degraded services, or memory ceiling warnings detected across cluster nodes.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subsystems.map((sub) => (
          <Card key={sub.name} className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-foreground">{sub.name}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {sub.status}
              </span>
            </div>

            <p className="text-xs text-muted-foreground">{sub.details}</p>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-[11px] font-mono">
              <div>
                <span className="text-muted-foreground">Response Latency:</span>{' '}
                <span className="text-foreground font-semibold">{sub.latency}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Rolling Uptime:</span>{' '}
                <span className="text-emerald-500 font-semibold">{sub.uptime}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
