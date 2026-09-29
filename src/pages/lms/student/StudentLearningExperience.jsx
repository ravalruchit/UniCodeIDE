import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { lmsService } from '../../../services/lmsService';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { ProgressBar } from '../../../components/lms/ProgressBar';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  Code2,
  FileText,
  ExternalLink,
  Copy,
  Check,
  Menu,
  X,
  Award,
  Sparkles,
} from 'lucide-react';

export default function StudentLearningExperience() {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sidebar toggle for focused mode
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [togglingProgress, setTogglingProgress] = useState(false);
  const [celebrateCompletion, setCelebrateCompletion] = useState(false);

  // Flattened ordered lessons list for smooth next/prev navigation
  const allLessons = [];
  curriculum.forEach((m) => {
    (m.lessons || []).forEach((l) => {
      allLessons.push({ ...l, moduleId: m._id, moduleTitle: m.title });
    });
  });

  const activeLessonIndex = allLessons.findIndex((l) => l._id === activeLesson?._id);
  const prevLesson = activeLessonIndex > 0 ? allLessons[activeLessonIndex - 1] : null;
  const nextLesson =
    activeLessonIndex >= 0 && activeLessonIndex < allLessons.length - 1
      ? allLessons[activeLessonIndex + 1]
      : null;

  const totalLessons = allLessons.length;
  const completedLessons = allLessons.filter((l) => l.isCompleted).length;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const fetchLearningData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [cRes, currRes] = await Promise.all([
        lmsService.getCourse(courseId),
        lmsService.getCourseCurriculum(courseId),
      ]);

      if (cRes.success) setCourse(cRes.course);
      if (currRes.success) {
        const curr = currRes.curriculum || [];
        setCurriculum(curr);

        // Find first incomplete lesson, or default to first lesson
        let targetLesson = null;
        let targetModule = null;

        for (const mod of curr) {
          for (const les of mod.lessons || []) {
            if (!les.isCompleted && !targetLesson) {
              targetLesson = les;
              targetModule = mod;
              break;
            }
          }
          if (targetLesson) break;
        }

        if (!targetLesson && curr.length > 0 && curr[0].lessons?.length > 0) {
          targetLesson = curr[0].lessons[0];
          targetModule = curr[0];
        }

        if (targetLesson) {
          setActiveLesson(targetLesson);
          setActiveModule(targetModule);
          // Record view
          lmsService.getLesson(targetLesson._id).catch(() => {});
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load lesson curriculum');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLearningData();
  }, [courseId]);

  const handleSelectLesson = (lesson, mod) => {
    setActiveLesson(lesson);
    setActiveModule(mod);
    lmsService.getLesson(lesson._id).catch(() => {});
    // On mobile, auto close sidebar on select
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleToggleProgress = async () => {
    if (!activeLesson || togglingProgress) return;
    try {
      setTogglingProgress(true);
      const willBeCompleted = !activeLesson.isCompleted;
      const res = await lmsService.toggleLessonProgress(activeLesson._id, willBeCompleted);

      if (res.success) {
        // Update local lesson state
        setActiveLesson((prev) => ({ ...prev, isCompleted: willBeCompleted }));
        setCurriculum((prev) =>
          prev.map((m) => ({
            ...m,
            lessons: m.lessons.map((l) =>
              l._id === activeLesson._id ? { ...l, isCompleted: willBeCompleted } : l
            ),
          }))
        );

        if (res.progress?.courseProgress?.percentage === 100) {
          setCelebrateCompletion(true);
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to update progress');
    } finally {
      setTogglingProgress(false);
    }
  };

  const copyCode = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center space-y-3">
          <BookOpen className="w-8 h-8 text-primary animate-pulse mx-auto" />
          <p className="text-sm font-medium text-muted-foreground">Opening your classroom environment...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-8 text-center rounded-xl border border-destructive/30 bg-destructive/5 text-destructive space-y-3 m-6">
        <p className="text-sm font-semibold">{error || 'Course not found'}</p>
        <Link to="/app/student/courses">
          <Button variant="outline" size="sm">
            Back to Courses
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-70px)] -m-4 sm:-m-6 overflow-hidden bg-background">
      {/* 100% Celebration Banner */}
      {celebrateCompletion && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 flex items-center justify-between text-xs font-medium z-50 animate-fade-in shadow-md">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-300" />
            <span>Congratulations! You have completed 100% of this course curriculum!</span>
          </div>
          <button
            type="button"
            onClick={() => setCelebrateCompletion(false)}
            className="hover:opacity-80 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Learning Shell Navbar */}
      <header className="h-14 border-b border-border bg-card px-4 flex items-center justify-between shrink-0 select-none z-20">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to={`/app/student/courses/${courseId}`}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Exit to Course Details"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer md:flex items-center gap-1.5 text-xs font-medium"
            title="Toggle Curriculum Sidebar"
          >
            <Menu className="w-4 h-4" />
            <span className="hidden sm:inline">Outline</span>
          </button>

          <div className="h-4 w-px bg-border hidden sm:block" />

          <div className="min-w-0">
            <h2 className="text-xs font-semibold text-foreground truncate max-w-xs sm:max-w-md">
              {course.title}
            </h2>
            <p className="text-[10px] text-muted-foreground font-mono truncate">
              {activeModule?.title || 'Learning Track'}
            </p>
          </div>
        </div>

        {/* Progress Bar Widget */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden md:flex flex-col items-end w-36">
            <div className="flex items-center justify-between w-full text-[10px] font-mono text-muted-foreground mb-1">
              <span>Progress</span>
              <span className="font-semibold text-foreground">{progressPercentage}%</span>
            </div>
            <ProgressBar value={progressPercentage} size="sm" showLabel={false} />
          </div>

          <button
            type="button"
            onClick={handleToggleProgress}
            disabled={togglingProgress || !activeLesson}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer shadow-xs disabled:opacity-50 ${
              activeLesson?.isCompleted
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{activeLesson?.isCompleted ? 'Completed' : 'Mark Complete'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Curriculum Outline Drawer */}
        <aside
          className={`border-r border-border bg-card transition-all duration-300 flex flex-col shrink-0 ${
            sidebarOpen ? 'w-80' : 'w-0 -ml-80'
          } overflow-hidden z-10`}
        >
          <div className="p-3 border-b border-border bg-muted/20 flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              Curriculum Outline
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">
              {completedLessons} of {totalLessons} done
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {curriculum.map((mod, modIdx) => (
              <div key={mod._id} className="py-2">
                <div className="px-4 py-1.5 text-xs font-bold text-foreground truncate">
                  {mod.title}
                </div>
                <div className="space-y-0.5 mt-1">
                  {(mod.lessons || []).map((les) => {
                    const isCurrent = activeLesson?._id === les._id;
                    return (
                      <button
                        key={les._id}
                        type="button"
                        onClick={() => handleSelectLesson(les, mod)}
                        className={`w-full px-4 py-2 flex items-center justify-between text-left text-xs transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-primary/10 border-l-4 border-l-primary font-semibold text-foreground'
                            : 'hover:bg-muted/40 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate pr-2">
                          {les.isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0" />
                          )}
                          <span className="truncate">{les.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                          {les.duration}m
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Center: Distraction-Free Lesson Content */}
        <main className="flex-1 flex flex-col overflow-hidden bg-background">
          <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl mx-auto w-full space-y-8">
            {activeLesson ? (
              <>
                {/* Lesson Header */}
                <div className="space-y-3 pb-6 border-b border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                    <span className="px-2 py-0.5 rounded bg-muted border border-border">
                      {activeLesson.type}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {activeLesson.duration} Minutes
                    </span>
                  </div>

                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                    {activeLesson.title}
                  </h1>

                  {activeLesson.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {activeLesson.description}
                    </p>
                  )}
                </div>

                {/* Lesson Content Area */}
                <div className="prose prose-neutral dark:prose-invert max-w-none text-foreground/90 text-sm leading-relaxed space-y-4">
                  <div className="whitespace-pre-wrap">{activeLesson.content}</div>
                </div>

                {/* Attached Code Samples & Resources */}
                {activeLesson.resources?.length > 0 && (
                  <div className="pt-6 border-t border-border space-y-4">
                    <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-primary" />
                      Attached Study Materials & Labs
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activeLesson.resources.map((res, idx) => (
                        <Card key={idx} className="p-4 space-y-2 border-border/80">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground truncate">
                              {res.title}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                              {res.type}
                            </span>
                          </div>

                          {res.url && (
                            <a
                              href={res.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1 truncate"
                            >
                              <span>Open Reference</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}

                          {res.codeSnippet && (
                            <div className="relative">
                              <pre className="p-3 rounded bg-muted/60 text-[11px] font-mono text-foreground overflow-x-auto">
                                <code>{res.codeSnippet}</code>
                              </pre>
                              <button
                                type="button"
                                onClick={() => copyCode(res.codeSnippet)}
                                className="absolute top-2 right-2 p-1 rounded bg-background/80 hover:bg-background border border-border text-muted-foreground hover:text-foreground text-[10px] flex items-center gap-1 cursor-pointer"
                              >
                                {copiedSnippet ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedSnippet ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-24 text-center space-y-2">
                <BookOpen className="w-10 h-10 text-muted-foreground mx-auto opacity-40" />
                <p className="text-sm font-semibold text-foreground">Select a lesson to begin learning</p>
              </div>
            )}
          </div>

          {/* Bottom Persistent Navigation Bar */}
          <footer className="h-16 border-t border-border bg-card px-6 flex items-center justify-between shrink-0 select-none">
            <Button
              variant="outline"
              size="sm"
              disabled={!prevLesson}
              onClick={() => prevLesson && handleSelectLesson(prevLesson, { title: prevLesson.moduleTitle, _id: prevLesson.moduleId })}
              className="gap-2 text-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous Lesson</span>
            </Button>

            <button
              type="button"
              onClick={handleToggleProgress}
              disabled={togglingProgress || !activeLesson}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                activeLesson?.isCompleted
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{activeLesson?.isCompleted ? 'Marked as Complete' : 'Mark as Complete'}</span>
            </button>

            <Button
              variant="outline"
              size="sm"
              disabled={!nextLesson}
              onClick={() => nextLesson && handleSelectLesson(nextLesson, { title: nextLesson.moduleTitle, _id: nextLesson.moduleId })}
              className="gap-2 text-xs"
            >
              <span className="hidden sm:inline">Next Lesson</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </footer>
        </main>
      </div>
    </div>
  );
}
