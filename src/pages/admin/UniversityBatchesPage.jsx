import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Calendar,
  Plus,
  Users,
  Layers,
  GraduationCap,
  Clock,
  ArrowRight,
} from 'lucide-react';

export default function UniversityBatchesPage() {
  const batches = [
    {
      id: 'BATCH-2026',
      name: 'Class of 2026 (Undergraduate)',
      department: 'Computer Science & Engineering',
      studentCount: 180,
      activeCourses: 3,
      currentSemester: 'Semester 3 (Fall 2026)',
      status: 'ACTIVE',
    },
    {
      id: 'BATCH-2025',
      name: 'Class of 2025 (Undergraduate)',
      department: 'Computer Science & Engineering',
      studentCount: 165,
      activeCourses: 2,
      currentSemester: 'Semester 5 (Fall 2026)',
      status: 'ACTIVE',
    },
    {
      id: 'BATCH-2024-PG',
      name: 'Class of 2024 (Postgraduate M.Tech)',
      department: 'Information Technology',
      studentCount: 45,
      activeCourses: 2,
      currentSemester: 'Semester 1 (Fall 2026)',
      status: 'ACTIVE',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2 sm:p-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <Calendar className="h-6 w-6 text-primary" />
            <span>Academic Batches & Cohorts</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Organize student bodies into academic graduating classes, semesters, and departmental sections.
          </p>
        </div>

        <Button
          size="sm"
          className="gap-2"
          onClick={() => alert('New batch creation modal opened.')}
        >
          <Plus className="h-4 w-4" />
          <span>Create Academic Batch</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches.map((b) => (
          <Card key={b.id} className="p-6 space-y-4 border-border flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  {b.id}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold">
                  {b.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-foreground">{b.name}</h3>

              <div className="space-y-2 text-xs text-muted-foreground pt-1">
                <div className="flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <span>{b.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <span>{b.currentSemester}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <span className="font-mono font-semibold text-foreground">
                    {b.studentCount}
                  </span>{' '}
                  Students Registered
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{b.activeCourses} Active Subjects</span>
              <button
                onClick={() => alert(`Inspecting batch ${b.id}`)}
                className="text-primary font-medium hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Cohort</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
