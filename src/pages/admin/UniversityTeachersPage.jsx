import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Users,
  Search,
  UserPlus,
  Mail,
  Building2,
  CheckCircle2,
  Layers,
  BookOpen,
} from 'lucide-react';

export default function UniversityTeachersPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const teachers = [
    {
      id: 'TCH-001',
      name: 'Prof. David Vance',
      email: 'david.vance@meridian.edu',
      department: 'Computer Science & Engineering',
      courses: ['CS101 - Introduction to CS', 'CS301 - Systems Programming'],
      status: 'ACTIVE',
      joinedDate: 'Jan 2024',
    },
    {
      id: 'TCH-002',
      name: 'Prof. Sarah Jenkins',
      email: 'sarah.jenkins@meridian.edu',
      department: 'Computer Science & Engineering',
      courses: ['CS201 - Data Structures'],
      status: 'ACTIVE',
      joinedDate: 'Aug 2024',
    },
    {
      id: 'TCH-003',
      name: 'Dr. Robert Torres',
      email: 'robert.torres@meridian.edu',
      department: 'Electrical & Computer Engineering',
      courses: ['ECE210 - Digital Logic Design'],
      status: 'ACTIVE',
      joinedDate: 'Jan 2025',
    },
  ];

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2 sm:p-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <Users className="h-6 w-6 text-primary" />
            <span>Teaching Faculty & Instructors</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage academic instructors, course allocations, and faculty departmental assignments.
          </p>
        </div>

        <Button
          size="sm"
          className="gap-2"
          onClick={() => alert('Faculty invitation modal opened.')}
        >
          <UserPlus className="h-4 w-4" />
          <span>Invite Faculty</span>
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-foreground">{teachers.length}</div>
            <div className="text-xs text-muted-foreground">Total Faculty Members</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-emerald-500">100%</div>
            <div className="text-xs text-muted-foreground">Active Instructors</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <BookOpen className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-foreground">4</div>
            <div className="text-xs text-muted-foreground">Allocated Courses</div>
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm w-full">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search faculty by name, email or department..."
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
                <th className="px-5 py-3 font-semibold">Faculty Member</th>
                <th className="px-5 py-3 font-semibold">Department</th>
                <th className="px-5 py-3 font-semibold">Allocated Courses</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Onboarded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredTeachers.map((t) => (
                <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-foreground">{t.name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{t.email}</div>
                  </td>
                  <td className="px-5 py-3.5 text-foreground">{t.department}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {t.courses.map((c) => (
                        <span
                          key={c}
                          className="font-mono text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold">
                      {t.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-muted-foreground">{t.joinedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
