import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  BarChart3,
  Download,
  Building2,
  Users,
  GraduationCap,
  Award,
  FileCheck2,
  CheckCircle2,
} from 'lucide-react';

export default function UniversityReportsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2 sm:p-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span>Campus Accreditation & Academic Audits</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Export accreditation audit logs, laboratory computer usage, faculty evaluation turnaround, and student practical hours.
          </p>
        </div>

        <Button
          size="sm"
          className="gap-2"
          onClick={() => alert('ABET / NBA accreditation audit bundle exported.')}
        >
          <Download className="h-4 w-4" />
          <span>Export Compliance Audit</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Total Practical Hours Logged</div>
          <div className="text-2xl font-bold font-mono text-foreground mt-1">14,820 hrs</div>
          <div className="text-[11px] text-emerald-500 mt-1 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Exceeds ABET requirement
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Verified Practical Submissions</div>
          <div className="text-2xl font-bold font-mono text-foreground mt-1">3,490</div>
          <div className="text-[11px] text-muted-foreground mt-1">Across 12 courses</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Proctored Coding Exams</div>
          <div className="text-2xl font-bold font-mono text-foreground mt-1">24</div>
          <div className="text-[11px] text-emerald-500 mt-1">100% telemetry verified</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Lab Machine Utilization</div>
          <div className="text-2xl font-bold font-mono text-primary mt-1">87.4%</div>
          <div className="text-[11px] text-muted-foreground mt-1">Campus Lab Rooms 01-04</div>
        </Card>
      </div>

      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider font-mono">
          Departmental Practical Completion Index
        </h3>
        <div className="space-y-3">
          {[
            { dept: 'Computer Science & Engineering', completion: 94, students: 345 },
            { dept: 'Information Technology', completion: 88, students: 210 },
            { dept: 'Electrical & Computer Engineering', completion: 82, students: 180 },
          ].map((item) => (
            <div key={item.dept} className="space-y-1 text-xs">
              <div className="flex justify-between font-medium">
                <span className="text-foreground">{item.dept}</span>
                <span className="text-muted-foreground font-mono">{item.completion}% completed</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${item.completion}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
