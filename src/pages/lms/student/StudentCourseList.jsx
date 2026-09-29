import React, { useState, useEffect } from 'react';
import { lmsService } from '../../../services/lmsService';
import { CourseCard } from '../../../components/lms/CourseCard';
import { Button } from '../../../components/ui/Button';
import {
  BookOpen,
  Compass,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';

export default function StudentCourseList() {
  const [activeTab, setActiveTab] = useState('enrolled'); // 'enrolled' | 'catalog'
  const [enrolledList, setEnrolledList] = useState([]);
  const [catalogList, setCatalogList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [enrollingId, setEnrollingId] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [myRes, catRes] = await Promise.all([
        lmsService.getMyEnrolledCourses('ACTIVE'),
        lmsService.getCourses(),
      ]);

      if (myRes.success) setEnrolledList(myRes.enrollments || []);
      if (catRes.success) setCatalogList(catRes.courses || []);
    } catch (err) {
      setError(err.message || 'Failed to load course catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      setEnrollingId(courseId);
      const res = await lmsService.enrollInCourse(courseId);
      if (res.success) {
        showNotification('Successfully enrolled! Course added to your workspace.');
        await fetchStudentData();
        setActiveTab('enrolled');
      }
    } catch (err) {
      showNotification(err.message || 'Failed to enroll in course', 'error');
    } finally {
      setEnrollingId(null);
    }
  };

  const enrolledCourseIds = new Set(
    enrolledList.map((e) => e.course?._id?.toString()).filter(Boolean)
  );

  const filteredEnrolled = enrolledList.filter((e) => {
    const s = searchTerm.toLowerCase();
    const c = e.course;
    if (!c) return false;
    return (
      c.title.toLowerCase().includes(s) ||
      c.code.toLowerCase().includes(s) ||
      (c.description && c.description.toLowerCase().includes(s))
    );
  });

  const filteredCatalog = catalogList.filter((c) => {
    const s = searchTerm.toLowerCase();
    return (
      c.title.toLowerCase().includes(s) ||
      c.code.toLowerCase().includes(s) ||
      (c.description && c.description.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between border ${
            notification.type === 'error'
              ? 'bg-destructive/10 border-destructive/30 text-destructive'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            {notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{notification.msg}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Academic Courses
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Access your active courses, continue where you left off, and explore new university electives.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchStudentData}
          disabled={loading}
          className="gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 border-b md:border-b-0 border-border">
          <button
            type="button"
            onClick={() => setActiveTab('enrolled')}
            className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'enrolled'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>My Courses ({enrolledList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'catalog'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Course Catalog ({catalogList.length})</span>
          </button>
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Course Grid View */}
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
          <Button variant="outline" size="sm" onClick={fetchStudentData}>
            Retry
          </Button>
        </div>
      ) : activeTab === 'enrolled' ? (
        filteredEnrolled.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-dashed border-border bg-card space-y-3">
            <Sparkles className="w-10 h-10 text-muted-foreground mx-auto opacity-40" />
            <h3 className="text-base font-semibold text-foreground">No Enrolled Courses</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              You haven't enrolled in any courses yet. Switch over to the Course Catalog to browse available subjects.
            </p>
            <Button size="sm" onClick={() => setActiveTab('catalog')} className="mt-2">
              Browse Course Catalog
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEnrolled.map((entry) => (
              <CourseCard
                key={entry.enrollmentId}
                course={{ ...entry.course, isEnrolled: true }}
                role="STUDENT"
                progress={entry.progress}
              />
            ))}
          </div>
        )
      ) : (
        // Catalog Tab
        filteredCatalog.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-dashed border-border bg-card space-y-3">
            <Compass className="w-10 h-10 text-muted-foreground mx-auto opacity-40" />
            <h3 className="text-base font-semibold text-foreground">No Catalog Courses</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No published courses found matching your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCatalog.map((course) => {
              const isAlreadyEnrolled = enrolledCourseIds.has(course._id.toString());
              return (
                <CourseCard
                  key={course._id}
                  course={{ ...course, isEnrolled: isAlreadyEnrolled }}
                  role="STUDENT"
                  onEnroll={!isAlreadyEnrolled ? handleEnroll : null}
                  isEnrolling={enrollingId === course._id}
                />
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
