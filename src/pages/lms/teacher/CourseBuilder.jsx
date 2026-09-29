import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { lmsService } from '../../../services/lmsService';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { CourseStatusBadge } from '../../../components/lms/CourseStatusBadge';
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Trash2,
  Save,
  Eye,
  Edit3,
  Code2,
  FileText,
  Video,
  ExternalLink,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

const LESSON_TYPES = [
  { value: 'ARTICLE', label: 'Article / Guide', icon: FileText },
  { value: 'CODE_EXAMPLE', label: 'Code Lab / Example', icon: Code2 },
  { value: 'VIDEO', label: 'Video Lecture', icon: Video },
  { value: 'DOCUMENT', label: 'Document / PDF', icon: BookOpen },
  { value: 'RESOURCE', label: 'External Resource', icon: ExternalLink },
];

export default function CourseBuilder() {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active selection
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeModuleId, setActiveModuleId] = useState(null);

  // Lesson Edit Form State
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    type: 'ARTICLE',
    duration: 15,
    content: '',
    resources: [],
  });

  // UI state
  const [isPreview, setIsPreview] = useState(false);
  const [savingLesson, setSavingLesson] = useState(false);
  const [notification, setNotification] = useState(null);

  // Module modal state
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDesc, setModuleDesc] = useState('');
  const [creatingModule, setCreatingModule] = useState(false);

  // New resource modal state
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [resourceForm, setResourceForm] = useState({
    title: '',
    type: 'LINK',
    url: '',
    codeSnippet: '',
  });

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchCurriculum = async () => {
    try {
      setLoading(true);
      const [cRes, currRes] = await Promise.all([
        lmsService.getCourse(courseId),
        lmsService.getCourseCurriculum(courseId),
      ]);

      if (cRes.success) setCourse(cRes.course);
      if (currRes.success) {
        setCurriculum(currRes.curriculum || []);

        // Default to first lesson if none selected
        if (!activeLesson && currRes.curriculum?.length > 0) {
          const firstMod = currRes.curriculum[0];
          if (firstMod.lessons?.length > 0) {
            selectLesson(firstMod.lessons[0], firstMod._id);
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load course builder data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurriculum();
  }, [courseId]);

  const selectLesson = (lesson, moduleId) => {
    setActiveLesson(lesson);
    setActiveModuleId(moduleId);
    setLessonForm({
      title: lesson.title || '',
      description: lesson.description || '',
      type: lesson.type || 'ARTICLE',
      duration: lesson.duration || 15,
      content: lesson.content || '',
      resources: lesson.resources || [],
    });
    setIsPreview(false);
  };

  const handleSaveLesson = async () => {
    if (!activeLesson) return;
    try {
      setSavingLesson(true);
      const res = await lmsService.updateLesson(activeLesson._id, lessonForm);
      if (res.success) {
        showNotification('Lesson saved successfully');
        // Update local state
        setCurriculum((prev) =>
          prev.map((mod) => ({
            ...mod,
            lessons: mod.lessons.map((l) =>
              l._id === activeLesson._id ? { ...l, ...lessonForm } : l
            ),
          }))
        );
        setActiveLesson((prev) => ({ ...prev, ...lessonForm }));
      }
    } catch (err) {
      showNotification(err.message || 'Failed to save lesson', 'error');
    } finally {
      setSavingLesson(false);
    }
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!moduleTitle.trim()) return;

    try {
      setCreatingModule(true);
      const res = await lmsService.createModule(courseId, {
        title: moduleTitle.trim(),
        description: moduleDesc.trim(),
      });
      if (res.success) {
        showNotification('Module created');
        setIsModuleModalOpen(false);
        setModuleTitle('');
        setModuleDesc('');
        fetchCurriculum();
      }
    } catch (err) {
      showNotification(err.message || 'Failed to create module', 'error');
    } finally {
      setCreatingModule(false);
    }
  };

  const handleDeleteModule = async (modId) => {
    if (!window.confirm('Delete this module and all its lessons?')) return;
    try {
      await lmsService.deleteModule(modId);
      showNotification('Module deleted');
      if (activeModuleId === modId) {
        setActiveLesson(null);
        setActiveModuleId(null);
      }
      fetchCurriculum();
    } catch (err) {
      showNotification(err.message || 'Failed to delete module', 'error');
    }
  };

  const handleCreateLesson = async (moduleId) => {
    try {
      const res = await lmsService.createLesson(moduleId, {
        title: 'Untitled Lesson',
        description: 'Lesson description...',
        type: 'ARTICLE',
        duration: 15,
        content: '# New Lesson\n\nEnter lesson content here...',
      });
      if (res.success) {
        showNotification('New lesson created');
        await fetchCurriculum();
        selectLesson(res.lesson, moduleId);
      }
    } catch (err) {
      showNotification(err.message || 'Failed to create lesson', 'error');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;
    try {
      await lmsService.deleteLesson(lessonId);
      showNotification('Lesson deleted');
      setActiveLesson(null);
      fetchCurriculum();
    } catch (err) {
      showNotification(err.message || 'Failed to delete lesson', 'error');
    }
  };

  const handleAddResource = (e) => {
    e.preventDefault();
    if (!resourceForm.title.trim()) return;

    setLessonForm((prev) => ({
      ...prev,
      resources: [...prev.resources, { ...resourceForm }],
    }));
    setIsResourceModalOpen(false);
    setResourceForm({ title: '', type: 'LINK', url: '', codeSnippet: '' });
  };

  const handleRemoveResource = (index) => {
    setLessonForm((prev) => ({
      ...prev,
      resources: prev.resources.filter((_, idx) => idx !== index),
    }));
  };

  const handleStatusToggle = async () => {
    const nextStatus = course.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await lmsService.updateCourseStatus(courseId, nextStatus);
      setCourse((prev) => ({ ...prev, status: nextStatus }));
      showNotification(`Course is now ${nextStatus}`);
    } catch (err) {
      showNotification(err.message || 'Failed to toggle status', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-36 bg-muted rounded" />
        <div className="h-20 bg-card rounded-xl border border-border" />
        <div className="h-[600px] bg-card rounded-xl border border-border" />
      </div>
    );
  }

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

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            to="/app/teacher/courses"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Courses</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {course?.title}
            </h1>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted border border-border">
              {course?.code}
            </span>
            <CourseStatusBadge status={course?.status} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleStatusToggle}
            className="text-xs gap-1.5"
          >
            {course?.status === 'PUBLISHED' ? 'Switch to Draft' : 'Publish Course'}
          </Button>

          {activeLesson && (
            <Button
              size="sm"
              onClick={handleSaveLesson}
              disabled={savingLesson}
              className="gap-1.5 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{savingLesson ? 'Saving...' : 'Save Lesson'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Curriculum Modules & Lessons Tree */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-primary" />
              Course Structure
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModuleModalOpen(true)}
              className="text-xs h-7 px-2.5 gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Module</span>
            </Button>
          </div>

          <div className="space-y-3">
            {curriculum.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border rounded-lg bg-card">
                <p className="text-xs text-muted-foreground mb-3">No modules in this course yet.</p>
                <Button size="sm" onClick={() => setIsModuleModalOpen(true)}>
                  Create First Module
                </Button>
              </div>
            ) : (
              curriculum.map((mod) => (
                <Card key={mod._id} className="overflow-hidden border-border/80">
                  {/* Module Title Bar */}
                  <div className="p-3 bg-muted/30 border-b border-border flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <h3 className="text-xs font-bold text-foreground truncate">
                        {mod.title}
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        {mod.lessons?.length || 0} lessons
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCreateLesson(mod._id)}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Add Lesson to this module"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteModule(mod._id)}
                        className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer"
                        title="Delete Module"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Lessons in Module */}
                  <div className="divide-y divide-border/50">
                    {mod.lessons?.length === 0 ? (
                      <div className="p-3 text-[11px] text-muted-foreground italic text-center">
                        No lessons yet.{' '}
                        <button
                          type="button"
                          onClick={() => handleCreateLesson(mod._id)}
                          className="text-primary hover:underline font-medium cursor-pointer"
                        >
                          Add one
                        </button>
                      </div>
                    ) : (
                      mod.lessons.map((lesson) => {
                        const isSelected = activeLesson?._id === lesson._id;
                        return (
                          <div
                            key={lesson._id}
                            onClick={() => selectLesson(lesson, mod._id)}
                            className={`p-3 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-primary/10 border-l-2 border-l-primary font-semibold text-foreground'
                                : 'hover:bg-muted/20 text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              <FileText className="w-3.5 h-3.5 shrink-0 text-primary" />
                              <span className="truncate">{lesson.title}</span>
                            </div>

                            <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                              {lesson.duration}m
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Active Lesson Workspace */}
        <div className="lg:col-span-8">
          {activeLesson ? (
            <Card className="p-6 space-y-6">
              {/* Workspace Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-muted-foreground uppercase">
                    Editing Lesson
                  </span>
                  <input
                    type="text"
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    className="w-full text-lg font-bold bg-transparent border-0 border-b border-border/60 pb-1 text-foreground focus:outline-hidden focus:border-primary"
                    placeholder="Lesson Title"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPreview(!isPreview)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                      isPreview
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-muted border-border text-foreground'
                    }`}
                  >
                    {isPreview ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{isPreview ? 'Edit Code' : 'Preview'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteLesson(activeLesson._id)}
                    className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer border border-border"
                    title="Delete Lesson"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Lesson Metadata Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                    Lesson Type
                  </label>
                  <select
                    value={lessonForm.type}
                    onChange={(e) => setLessonForm({ ...lessonForm, type: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {LESSON_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                    Estimated Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={lessonForm.duration}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, duration: parseInt(e.target.value) || 15 })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                  Summary / Learning Objectives
                </label>
                <textarea
                  rows={2}
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                  placeholder="Short description for students..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              {/* Lesson Body Content Editor / Markdown Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                    Lesson Content (Markdown & Code)
                  </label>
                </div>

                {isPreview ? (
                  <div className="p-5 rounded-lg border border-border bg-background/50 prose prose-neutral dark:prose-invert max-w-none text-xs leading-relaxed min-h-[300px]">
                    <div className="whitespace-pre-wrap">{lessonForm.content}</div>
                  </div>
                ) : (
                  <textarea
                    rows={14}
                    value={lessonForm.content}
                    onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                    placeholder="Write detailed lesson theory, instructions, and code blocks using Markdown..."
                    className="w-full p-4 font-mono text-xs rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary leading-relaxed"
                  />
                )}
              </div>

              {/* Resource Attachments */}
              <div className="pt-4 border-t border-border space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                    Reference Attachments & Code ({lessonForm.resources.length})
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsResourceModalOpen(true)}
                    className="text-xs h-7 px-2.5 gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Attach Resource</span>
                  </Button>
                </div>

                <div className="space-y-2">
                  {lessonForm.resources.map((res, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-md border border-border bg-muted/20 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <ExternalLink className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="font-semibold text-foreground truncate">{res.title}</span>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">
                          ({res.type})
                        </span>
                        {res.url && (
                          <span className="text-muted-foreground truncate">{res.url}</span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveResource(idx)}
                        className="text-muted-foreground hover:text-destructive cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <div className="p-16 text-center border border-dashed border-border rounded-xl bg-card space-y-3">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto opacity-40" />
              <h3 className="text-base font-semibold text-foreground">Select a Lesson</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Pick a lesson from the left curriculum sidebar to edit content, or create a new lesson.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Module Modal */}
      {isModuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-fade-up">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-base">Add Curriculum Module</h3>
              <button
                type="button"
                onClick={() => setIsModuleModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateModule} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                  Module Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 3: Dynamic Programming"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="What key competencies will students master in this module?"
                  value={moduleDesc}
                  onChange={(e) => setModuleDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModuleModalOpen(false)}
                  disabled={creatingModule}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={creatingModule}>
                  {creatingModule ? 'Creating...' : 'Create Module'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attach Resource Modal */}
      {isResourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-fade-up">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-base">Attach Learning Resource</h3>
              <button
                type="button"
                onClick={() => setIsResourceModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddResource} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                  Resource Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Official Documentation"
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                  Resource Type
                </label>
                <select
                  value={resourceForm.type}
                  onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="LINK">External Web Link</option>
                  <option value="PDF">PDF / Document</option>
                  <option value="CODE">Code Snippet</option>
                  <option value="SLIDES">Lecture Slides</option>
                </select>
              </div>

              {resourceForm.type !== 'CODE' ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                    URL / Resource Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://docs.python.org/..."
                    value={resourceForm.url}
                    onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                    Code Snippet
                  </label>
                  <textarea
                    rows={4}
                    placeholder="paste sample code..."
                    value={resourceForm.codeSnippet}
                    onChange={(e) => setResourceForm({ ...resourceForm, codeSnippet: e.target.value })}
                    className="w-full p-3 font-mono text-xs rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsResourceModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Add Attachment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
