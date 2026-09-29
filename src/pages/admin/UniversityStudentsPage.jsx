import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  GraduationCap,
  Search,
  Upload,
  UserPlus,
  Building2,
  Calendar,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export default function UniversityStudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const students = [
    {
      id: 'STD-2026-001',
      name: 'Alex Rivera',
      email: 'alex.rivera@meridian.edu',
      department: 'Computer Science & Engineering',
      batch: 'Batch 2026',
      enrollments: 2,
      status: 'ACTIVE',
    },
    {
      id: 'STD-2026-002',
      name: 'Elena Rostova',
      email: 'elena.rostova@meridian.edu',
      department: 'Computer Science & Engineering',
      batch: 'Batch 2026',
      enrollments: 2,
      status: 'ACTIVE',
    },
    {
      id: 'STD-2026-015',
      name: 'Marcus Chen',
      email: 'marcus.chen@meridian.edu',
      department: 'Computer Science & Engineering',
      batch: 'Batch 2025',
      enrollments: 1,
      status: 'ACTIVE',
    },
    {
      id: 'STD-2026-022',
      name: 'Priya Sharma',
      email: 'priya.sharma@meridian.edu',
      department: 'Information Technology',
      batch: 'Batch 2025',
      enrollments: 2,
      status: 'ACTIVE',
    },
  ];

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2 sm:p-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span>Campus Student Directory</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage student cohorts, departmental admissions, academic batches, and course enrollments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() => alert('Batch CSV upload dialog opened.')}
          >
            <Upload className="h-4 w-4" />
            <span>Batch CSV Import</span>
          </Button>
          <Button
            size="sm"
            className="gap-2"
            onClick={() => alert('Add single student modal opened.')}
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Student</span>
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-foreground">{students.length}</div>
            <div className="text-xs text-muted-foreground">Registered Students</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-emerald-500">100%</div>
            <div className="text-xs text-muted-foreground">Active Learners</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Calendar className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-foreground">2</div>
            <div className="text-xs text-muted-foreground">Active Batches</div>
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm w-full">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search students by name, ID or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Table Card */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/30 border-b border-border text-muted-foreground font-mono uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 font-semibold">Student Name & Roll No</th>
                <th className="px-5 py-3 font-semibold">Department</th>
                <th className="px-5 py-3 font-semibold">Batch</th>
                <th className="px-5 py-3 font-semibold">Enrolled Courses</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-foreground">{s.name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-2">
                      <span>{s.id}</span>
                      <span>•</span>
                      <span>{s.email}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-foreground">{s.department}</td>
                  <td className="px-5 py-3.5 font-mono text-muted-foreground">{s.batch}</td>
                  <td className="px-5 py-3.5 font-mono font-semibold text-foreground">
                    {s.enrollments} Active
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold">
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
