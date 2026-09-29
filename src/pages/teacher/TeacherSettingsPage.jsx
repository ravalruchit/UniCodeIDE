import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Settings, Save, CheckCircle2, Bell, Sliders, Shield } from 'lucide-react';

export default function TeacherSettingsPage() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoGrading, setAutoGrading] = useState(true);
  const [latePenalty, setLatePenalty] = useState(10);
  const [defaultTimeout, setDefaultTimeout] = useState(5);
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
          <span>Faculty & Evaluation Settings</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Configure grading policies, automated test runner limits, and notification preferences.
        </p>
      </div>

      {saved && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Settings successfully saved!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider font-mono flex items-center gap-2 border-b border-border pb-3">
            <Sliders className="h-4 w-4 text-primary" />
            <span>Grading Policies & Execution</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Instant Automated Evaluation</div>
                <div className="text-muted-foreground">Run student code against unit tests upon submission</div>
              </div>
              <input
                type="checkbox"
                checked={autoGrading}
                onChange={(e) => setAutoGrading(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="font-semibold text-foreground">Late Submission Penalty (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={latePenalty}
                onChange={(e) => setLatePenalty(Number(e.target.value))}
                className="w-full sm:w-48 px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="text-[10px] text-muted-foreground block">
                Percentage deducted from total marks for submissions after deadline.
              </span>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="font-semibold text-foreground">Default Code Execution Timeout (seconds)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={defaultTimeout}
                onChange={(e) => setDefaultTimeout(Number(e.target.value))}
                className="w-full sm:w-48 px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="text-[10px] text-muted-foreground block">
                Maximum time allowed for a single container execution run to prevent infinite loops.
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider font-mono flex items-center gap-2 border-b border-border pb-3">
            <Bell className="h-4 w-4 text-primary" />
            <span>Notifications</span>
          </h3>

          <div className="flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-foreground">Email Notifications on Submissions</div>
              <div className="text-muted-foreground">Receive digest when students submit assignments</div>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="sm" className="gap-2">
            <Save className="h-4 w-4" />
            <span>Save Preferences</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
