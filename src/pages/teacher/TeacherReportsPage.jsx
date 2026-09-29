import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  Clock,
  Download,
  CheckCircle2,
  FileCheck2,
  Code2,
} from 'lucide-react';

export default function TeacherReportsPage() {
  const assignmentReports = [
    {
      id: 'asg-1',
      title: 'Assignment 01: Hello World & Variables',
      language: 'PYTHON',
      submissions: 48,
      avgScore: '98.2%',
      passRate: '100%',
      avgExecutionTime: '0.42s',
    },
    {
      id: 'asg-2',
      title: 'Assignment 02: Control Structures & Loops',
      language: 'PYTHON',
      submissions: 47,
      avgScore: '91.5%',
      passRate: '95.7%',
      avgExecutionTime: '0.68s',
    },
    {
      id: 'asg-3',
      title: 'Assignment 03: Fibonacci Sequence & Recursion',
      language: 'PYTHON',
      submissions: 46,
      avgScore: '89.4%',
      passRate: '91.3%',
      avgExecutionTime: '0.55s',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2 sm:p-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span>Course Analytics & Evaluation Reports</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Aggregated cohort performance metrics, automated test pass rates, and submission evaluation trends.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="gap-2"
          onClick={() => alert('Faculty evaluation report downloaded (PDF format).')}
        >
          <Download className="h-4 w-4" />
          <span>Export Full Analytics</span>
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Cohort Pass Rate</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-500">95.6%</div>
          <p className="text-[11px] text-muted-foreground mt-1">Across all practical exercises</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Average Submission Score</span>
            <Award className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold font-mono text-foreground">93.0%</div>
          <p className="text-[11px] text-muted-foreground mt-1">+3.2% vs previous semester</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Total Test Executions</span>
            <Code2 className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-foreground">1,248</div>
          <p className="text-[11px] text-muted-foreground mt-1">Isolated Piston test runs</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Avg Container Latency</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-foreground">0.55s</div>
          <p className="text-[11px] text-muted-foreground mt-1">Fast Docker sandbox dispatch</p>
        </Card>
      </div>

      {/* Assignment Performance Breakdown */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider font-mono">
          Assignment Performance Summary
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/30 border-b border-border text-muted-foreground font-mono uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 font-semibold">Problem Title</th>
                <th className="px-4 py-3 font-semibold">Language</th>
                <th className="px-4 py-3 font-semibold">Total Submissions</th>
                <th className="px-4 py-3 font-semibold">Average Score</th>
                <th className="px-4 py-3 font-semibold">Pass Rate</th>
                <th className="px-4 py-3 font-semibold">Container Runtime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {assignmentReports.map((item) => (
                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-foreground">{item.title}</td>
                  <td className="px-4 py-3.5 font-mono text-primary">{item.language}</td>
                  <td className="px-4 py-3.5 font-mono">{item.submissions}</td>
                  <td className="px-4 py-3.5 font-mono font-bold text-foreground">{item.avgScore}</td>
                  <td className="px-4 py-3.5 font-mono font-bold text-emerald-500">{item.passRate}</td>
                  <td className="px-4 py-3.5 font-mono text-muted-foreground">{item.avgExecutionTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
