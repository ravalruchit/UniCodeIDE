import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { lmsService } from '../../services/lmsService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  GraduationCap,
  Search,
  BookOpen,
  Mail,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
  ExternalLink,
  Award,
} from 'lucide-react';

export default function TeacherStudentsPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('ALL');

  // Realistic mock cohort data linked to teacher's courses
  const students = [
    {
      id: 'STD-2026-001',
      name: 'Alex Rivera',
      email: 'alex.rivera@meridian.edu',
      courseCode: 'CS101',
      courseTitle: 'Introduction to Computer Science & Python',
      batch: 'Batch 2026 - CS-A',
      assignmentsCompleted: '3 / 3',
      averageScore: '98.5%',
      lastActive: '10 minutes ago',
      status: 'ACTIVE',
    },
    {
      id: 'STD-2026-002',
      name: 'Elena Rostova',
      email: 'elena.rostova@meridian.edu',
      courseCode: 'CS101',
      courseTitle: 'Introduction to Computer Science & Python',
      batch: 'Batch 2026 - CS-A',
      assignmentsCompleted: '3 / 3',
      averageScore: '94.0%',
      lastActive: '2 hours ago',
      status: 'ACTIVE',
    },
    {
      id: 'STD-2026-015',
      name: 'Marcus Chen',
      email: 'marcus.chen@meridian.edu',
      courseCode: 'CS201',
      courseTitle: 'Data Structures and Algorithmic Analysis',
      batch: 'Batch 2025 - CS-B',
      assignmentsCompleted: '2 / 3',
      averageScore: '89.2%',
      lastActive: 'Yesterday',
      status: 'ACTIVE',
    },
    {
      id: 'STD-2026-022',
      name: 'Priya Sharma',
      email: 'priya.sharma@meridian.edu',
      courseCode: 'CS201',
      courseTitle: 'Data Structures and Algorithmic Analysis',
      batch: 'Batch 2025 - CS-B',
      assignmentsCompleted: '3 / 3',
      averageScore: '96.0%',
      lastActive: '1 hour ago',
      status: 'ACTIVE',
    },
  ];

  useEffect(() => {
    let isMounted = true;
    lmsService
      .getTeacherCourses()
      .then((res) => {
        if (isMounted && res && res.success && res.courses) {
          setCourses(res.courses);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch teacher courses:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredStudents = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term) ||
      s.id.toLowerCase().includes(term);
    const matchesCourse =
      selectedCourseFilter === 'ALL' || s.courseCode === selectedCourseFilter;
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2 sm:p-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span>Enrolled Students Roster</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Monitor student cohort enrollment, assignment completion ratios, and practical lab participation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() => alert('Student roster export generated (CSV format).')}
          >
            <Award className="h-4 w-4 text-primary" />
            <span>Export Grades CSV</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold font-mono text-foreground">
            {students.length}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">Enrolled Students</div>
        </Card>

        <Card className="p-4 text-center">
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            96.4%
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">Completion Rate</div>
        </Card>

        <Card className="p-4 text-center">
          <div className="text-2xl font-bold font-mono text-primary">
            94.4%
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">Cohort Average</div>
        </Card>

        <Card className="p-4 text-center">
          <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
            {courses.length > 0 ? courses.length : 2}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">Active Courses</div>
        </Card>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search students by name, email or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground hidden sm:inline" />
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Enrolled Courses</option>
            {courses.length > 0 ? (
              courses.map((c) => (
                <option key={c._id || c.code} value={c.code}>
                  {c.code} - {c.title}
                </option>
              ))
            ) : (
              <>
                <option value="CS101">CS101 - Introduction to CS</option>
                <option value="CS201">CS201 - Data Structures</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Table Card */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/30 border-b border-border text-muted-foreground font-mono uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 font-semibold">Student Name & ID</th>
                <th className="px-5 py-3 font-semibold">Course</th>
                <th className="px-5 py-3 font-semibold">Batch</th>
                <th className="px-5 py-3 font-semibold">Homework Progress</th>
                <th className="px-5 py-3 font-semibold">Average Grade</th>
                <th className="px-5 py-3 font-semibold">Last Active</th>
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

                  <td className="px-5 py-3.5">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      {s.courseCode}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-muted-foreground font-mono">
                    {s.batch}
                  </td>

                  <td className="px-5 py-3.5 font-mono">
                    <span className="text-foreground font-semibold">{s.assignmentsCompleted}</span>
                  </td>

                  <td className="px-5 py-3.5 font-mono font-bold text-emerald-500">
                    {s.averageScore}
                  </td>

                  <td className="px-5 py-3.5 text-muted-foreground flex items-center gap-1.5 pt-4">
                    <Clock className="h-3 w-3 text-muted-foreground/70" />
                    <span>{s.lastActive}</span>
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
