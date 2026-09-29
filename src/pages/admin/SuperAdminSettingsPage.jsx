import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Settings, Save, CheckCircle2, Shield, Cpu, Sliders } from 'lucide-react';

export default function SuperAdminSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maxMemoryMb, setMaxMemoryMb] = useState(512);
  const [maxExecutionSeconds, setMaxExecutionSeconds] = useState(15);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-2 sm:p-6 text-left">
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
          <Settings className="h-6 w-6 text-primary" />
          <span>Global Platform Infrastructure Configuration</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Configure multi-tenant platform limits, sandbox memory cgroups, execution timeouts, and maintenance states.
        </p>
      </div>

      {saved && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Platform configuration saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider font-mono flex items-center gap-2 border-b border-border pb-3">
            <Cpu className="h-4 w-4 text-primary" />
            <span>Container Sandboxing & Piston Limits</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Container RAM Cap per Execution (MB)</label>
              <input
                type="number"
                min="128"
                max="2048"
                value={maxMemoryMb}
                onChange={(e) => setMaxMemoryMb(Number(e.target.value))}
                className="w-full sm:w-48 px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="text-[10px] text-muted-foreground block">
                Docker memory limit enforce on user code processes to prevent OOM across host nodes.
              </span>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="font-semibold text-foreground">Hard CPU Timeout (Seconds)</label>
              <input
                type="number"
                min="3"
                max="60"
                value={maxExecutionSeconds}
                onChange={(e) => setMaxExecutionSeconds(Number(e.target.value))}
                className="w-full sm:w-48 px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="text-[10px] text-muted-foreground block">
                Forceful SIGKILL dispatched if program does not terminate within this threshold.
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider font-mono flex items-center gap-2 border-b border-border pb-3">
            <Shield className="h-4 w-4 text-primary" />
            <span>Operational State</span>
          </h3>

          <div className="flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-foreground">Platform Maintenance Mode</div>
              <div className="text-muted-foreground">Restrict student and teacher logins during system upgrades</div>
            </div>
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="sm" className="gap-2">
            <Save className="h-4 w-4" />
            <span>Save Platform Settings</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
