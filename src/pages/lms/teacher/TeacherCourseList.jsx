import React, { useState, useEffect } from 'react';
import { lmsService } from '../../../services/lmsService';
import { CourseCard } from '../../../components/lms/CourseCard';
import { Button } from '../../../components/ui/Button';
import {
  BookOpen,
  Plus,
  RefreshCw,
  AlertCircle,
  Search,
  Sparkles,
} from 'lucide-react';

export default function TeacherCourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch courses assigned to this instructor or university courses
      const res = await lmsService.getCourses({ myCourses: 'true' });
      if (res.success) {
        setCourses(res.courses || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load assigned courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const filtered = courses.filter((c) => {
    const s = searchTerm.toLowerCase();
    return (
      c.title.toLowerCase().includes(s) ||
      c.code.toLowerCase().includes(s) ||
      (c.description && c.description.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            My Teaching Courses
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Author modules, write lessons, assign coding challenges, and oversee student cohorts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCourses}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search assigned courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-80 rounded-xl bg-card border border-border animate-pulse p-5 space-y-4">
              <div className="h-32 bg-muted rounded-lg" />
              <div className="h-5 w-3/4 bg-muted rounded" />
              <div className="h-4 w-1/2 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center rounded-xl border border-destructive/30 bg-destructive/5 text-destructive space-y-3">
          <AlertCircle className="w-8 h-8 mx-auto" />
          <p className="text-sm font-semibold">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchCourses}>
            Retry
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-border bg-card space-y-3">
          <Sparkles className="w-10 h-10 text-muted-foreground mx-auto opacity-40" />
          <h3 className="text-base font-semibold text-foreground">No Courses Assigned</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchTerm
              ? 'No courses match your filter criteria.'
              : 'You have not been assigned to any courses yet. Contact your university admin to allocate teaching modules.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              role="TEACHER"
            />
          ))}
        </div>
      )}
    </div>
  );
}
