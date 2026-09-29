import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { assignmentService } from '../../../services/assignmentService';
import { lmsService } from '../../../services/lmsService';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  Edit3,
  Plus,
  Trash2,
  Code2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  X,
  FileCode2,
  FileText,
  ShieldAlert,
} from 'lucide-react';

const LANGUAGES = [
  { value: 'PYTHON', label: 'Python 3.11' },
  { value: 'JAVASCRIPT', label: 'JavaScript (Node 20)' },
  { value: 'TYPESCRIPT', label: 'TypeScript (5.x)' },
  { value: 'JAVA', label: 'Java 17 (Temurin)' },
  { value: 'C', label: 'C (GCC 14)' },
  { value: 'CPP', label: 'C++ (GCC 14)' },
  { value: 'CSHARP', label: 'C# (.NET 8.0)' },
  { value: 'GO', label: 'Go 1.22' },
  { value: 'RUST', label: 'Rust 1.77' },
  { value: 'SQL', label: 'SQL (SQLite 3 / ANSI)' },
  { value: 'PHP', label: 'PHP (8.2 CLI)' },
  { value: 'RUBY', label: 'Ruby (3.2)' },
  { value: 'KOTLIN', label: 'Kotlin (JVM)' },
  { value: 'SWIFT', label: 'Swift (5.9 Linux)' },
  { value: 'DART', label: 'Dart (3.x SDK)' },
  { value: 'R', label: 'R (GNU Rscript)' },
  { value: 'BASH', label: 'Bash / Shell (5.2)' },
  { value: 'SCALA', label: 'Scala (3.x CLI)' },
  { value: 'LUA', label: 'Lua (5.4)' },
  { value: 'PERL', label: 'Perl (5.38)' },
];

export default function TeacherAssignmentEditor() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(assignmentId);

  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [previewInstructions, setPreviewInstructions] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    courseId: '',
    moduleId: '',
    description: '',
    instructions: '',
    type: 'CODING',
    programmingLanguage: 'PYTHON',
    difficulty: 'MEDIUM',
    totalMarks: 100,
    passingMarks: 40,
    dueDate: '',
    allowLateSubmission: false,
    latePenaltyPercent: 10,
    starterCode: '',
    maxAttempts: 3,
    testCases: [],
  });

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const cRes = await lmsService.getCourses({ myCourses: 'true' });
        const courseList = cRes.courses || [];
        setCourses(courseList);

        if (isEditing) {
          const asgRes = await assignmentService.getAssignment(assignmentId);
          if (asgRes.success) {
            const a = asgRes.assignment;
            const dueFormatted = a.dueDate
              ? new Date(a.dueDate).toISOString().slice(0, 16)
              : '';

            setForm({
              title: a.title || '',
              courseId: a.courseId?._id || a.courseId || '',
              moduleId: a.moduleId?._id || a.moduleId || '',
              description: a.description || '',
              instructions: a.instructions || '',
              type: a.type || 'CODING',
              programmingLanguage: a.programmingLanguage || 'PYTHON',
              difficulty: a.difficulty || 'MEDIUM',
              totalMarks: a.totalMarks || 100,
              passingMarks: a.passingMarks || 40,
              dueDate: dueFormatted,
              allowLateSubmission: a.allowLateSubmission || false,
              latePenaltyPercent: a.latePenaltyPercent || 0,
              starterCode: a.starterCode || '',
              maxAttempts: a.maxAttempts || 3,
              testCases: a.testCases || [],
            });

            // Fetch modules for this course
            if (a.courseId?._id || a.courseId) {
              const currRes = await lmsService.getCourseCurriculum(a.courseId?._id || a.courseId);
              if (currRes.success) setModules(currRes.curriculum || []);
            }
          }
        } else if (courseList.length > 0) {
          const defaultCourse = courseList[0]._id;
          // Set due date 7 days from now as default
          const defaultDue = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 16);

          setForm((prev) => ({
            ...prev,
            courseId: defaultCourse,
            dueDate: defaultDue,
            starterCode: '# Write your solution below\n\ndef solution():\n    pass\n',
          }));

          const currRes = await lmsService.getCourseCurriculum(defaultCourse);
          if (currRes.success) setModules(currRes.curriculum || []);
        }
      } catch (err) {
        showNotification(err.message || 'Failed to initialize editor', 'error');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [assignmentId, isEditing]);

  const handleCourseChange = async (e) => {
    const cId = e.target.value;
    setForm((prev) => ({ ...prev, courseId: cId, moduleId: '' }));
    if (cId) {
      try {
        const currRes = await lmsService.getCourseCurriculum(cId);
        if (currRes.success) setModules(currRes.curriculum || []);
      } catch {
        setModules([]);
      }
    } else {
      setModules([]);
    }
  };

  const handleAddTestCase = () => {
    setForm((prev) => ({
      ...prev,
      testCases: [
        ...prev.testCases,
        {
          name: `Test Case ${prev.testCases.length + 1}`,
          input: '',
          expectedOutput: '',
          points: 10,
          isHidden: false,
        },
      ],
    }));
  };

  const handleRemoveTestCase = (index) => {
    setForm((prev) => ({
      ...prev,
      testCases: prev.testCases.filter((_, idx) => idx !== index),
    }));
  };

  const handleTestCaseChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.testCases];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, testCases: updated };
    });
  };

  const handleSubmit = async (targetStatus) => {
    if (!form.title.trim()) {
      showNotification('Assignment title is required', 'error');
      return;
    }
    if (!form.courseId) {
      showNotification('Please associate a course', 'error');
      return;
    }
    if (!form.dueDate) {
      showNotification('A valid due date is required', 'error');
      return;
    }
    if (form.passingMarks > form.totalMarks) {
      showNotification('Passing marks cannot exceed total marks', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...form,
        status: targetStatus,
        totalMarks: Number(form.totalMarks),
        passingMarks: Number(form.passingMarks),
        maxAttempts: Number(form.maxAttempts),
        latePenaltyPercent: Number(form.latePenaltyPercent),
        moduleId: form.moduleId || null,
      };

      if (isEditing) {
        await assignmentService.updateAssignment(assignmentId, payload);
        showNotification('Assignment updated successfully');
      } else {
        await assignmentService.createAssignment(payload);
        showNotification('Assignment created successfully');
      }

      navigate('/app/teacher/assignments');
    } catch (err) {
      showNotification(err.message || 'Failed to save assignment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <div className="h-6 w-36 bg-muted rounded" />
        <div className="h-44 bg-card rounded-xl border border-border" />
        <div className="h-80 bg-card rounded-xl border border-border" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/app/teacher/assignments"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Assignments</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileCode2 className="w-6 h-6 text-primary" />
            {isEditing ? 'Edit Assignment' : 'Create New Assignment'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={submitting}
            onClick={() => handleSubmit('DRAFT')}
            className="gap-1.5 text-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save as Draft</span>
          </Button>

          <Button
            size="sm"
            disabled={submitting}
            onClick={() => handleSubmit('PUBLISHED')}
            className="gap-1.5 text-xs shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'Publishing...' : 'Publish to Students'}</span>
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1: Basic Information */}
        <Card className="p-6 space-y-4">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
            1. Basic Information
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Assignment Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Assignment 03: Binary Tree In-Order Traversal"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Course *
              </label>
              <select
                required
                value={form.courseId}
                onChange={handleCourseChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.code} - {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Associated Module (Optional)
              </label>
              <select
                value={form.moduleId}
                onChange={(e) => setForm({ ...form, moduleId: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Course Level (No specific module)</option>
                {modules.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Brief Overview / Summary
            </label>
            <textarea
              rows={2}
              placeholder="A short 1-2 sentence description shown in course listings..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>
        </Card>

        {/* Section 2: Programming Configuration */}
        <Card className="p-6 space-y-4">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
            2. Programming Configuration
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Programming Language *
              </label>
              <select
                value={form.programmingLanguage}
                onChange={(e) => setForm({ ...form, programmingLanguage: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Difficulty Level
              </label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">
                Starter Code Template
              </label>
              <span className="text-[11px] text-muted-foreground font-mono">
                Pre-populated in student workspace
              </span>
            </div>
            <textarea
              rows={8}
              value={form.starterCode}
              onChange={(e) => setForm({ ...form, starterCode: e.target.value })}
              placeholder="# Provide function signature and boilerplate code..."
              className="w-full p-3 font-mono text-xs rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary leading-relaxed"
            />
          </div>
        </Card>

        {/* Section 3: Detailed Problem Instructions */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              3. Instructions & Problem Statement (Markdown)
            </h3>
            <button
              type="button"
              onClick={() => setPreviewInstructions(!previewInstructions)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                previewInstructions
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background hover:bg-muted border-border text-foreground'
              }`}
            >
              {previewInstructions ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{previewInstructions ? 'Edit Markdown' : 'Preview Format'}</span>
            </button>
          </div>

          {previewInstructions ? (
            <div className="p-5 rounded-lg border border-border bg-background/50 prose prose-neutral dark:prose-invert max-w-none text-xs leading-relaxed min-h-[220px]">
              <div className="whitespace-pre-wrap">{form.instructions || 'No instructions written yet.'}</div>
            </div>
          ) : (
            <textarea
              rows={10}
              value={form.instructions}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              placeholder="### Objective&#10;Describe problem requirements, mathematical constraints, and input/output examples..."
              className="w-full p-4 font-mono text-xs rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary leading-relaxed"
            />
          )}
        </Card>

        {/* Section 4: Evaluation, Deadlines & Policy */}
        <Card className="p-6 space-y-4">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
            4. Evaluation & Submission Policies
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Total Marks *
              </label>
              <input
                type="number"
                min="1"
                required
                value={form.totalMarks}
                onChange={(e) => setForm({ ...form, totalMarks: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Passing Marks *
              </label>
              <input
                type="number"
                min="0"
                required
                value={form.passingMarks}
                onChange={(e) => setForm({ ...form, passingMarks: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Max Allowed Attempts *
              </label>
              <input
                type="number"
                min="1"
                max="10"
                required
                value={form.maxAttempts}
                onChange={(e) => setForm({ ...form, maxAttempts: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Submission Deadline *
              </label>
              <input
                type="datetime-local"
                required
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
              />
            </div>

            <div className="space-y-3 pt-6">
              <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.allowLateSubmission}
                  onChange={(e) => setForm({ ...form, allowLateSubmission: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span>Allow Late Submissions</span>
              </label>

              {form.allowLateSubmission && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Late Penalty:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.latePenaltyPercent}
                    onChange={(e) => setForm({ ...form, latePenaltyPercent: e.target.value })}
                    className="w-20 px-2 py-1 text-xs rounded border border-border bg-background text-foreground font-mono"
                  />
                  <span>% deduction</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Section 5: Test Case Architecture Foundation */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                5. Test Cases Foundation
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Saved for automated evaluation when Docker container sandbox is enabled.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddTestCase}
              className="text-xs gap-1 h-7"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Test Case</span>
            </Button>
          </div>

          <div className="space-y-3">
            {form.testCases.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-border rounded-lg bg-background text-xs text-muted-foreground">
                No test cases defined yet. Click "Add Test Case" to establish inputs and expected outputs.
              </div>
            ) : (
              form.testCases.map((tc, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg border border-border bg-muted/20 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={tc.name}
                      onChange={(e) => handleTestCaseChange(idx, 'name', e.target.value)}
                      placeholder="Test Case Name"
                      className="text-xs font-bold bg-transparent border-0 border-b border-border/60 text-foreground focus:outline-hidden focus:border-primary w-48"
                    />

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tc.isHidden}
                          onChange={(e) => handleTestCaseChange(idx, 'isHidden', e.target.checked)}
                          className="rounded border-border text-primary"
                        />
                        <span>Hidden Test</span>
                      </label>

                      <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
                        <span>Pts:</span>
                        <input
                          type="number"
                          min="0"
                          value={tc.points}
                          onChange={(e) => handleTestCaseChange(idx, 'points', Number(e.target.value))}
                          className="w-14 px-1.5 py-0.5 text-xs rounded border border-border bg-background text-foreground"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveTestCase(idx)}
                        className="text-muted-foreground hover:text-destructive cursor-pointer p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="font-mono text-[10px] text-muted-foreground uppercase">
                        Input
                      </span>
                      <textarea
                        rows={2}
                        value={tc.input}
                        onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)}
                        placeholder="e.g. [1, 2, 3]"
                        className="w-full p-2 font-mono text-xs rounded border border-border bg-background text-foreground resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="font-mono text-[10px] text-muted-foreground uppercase">
                        Expected Output *
                      </span>
                      <textarea
                        rows={2}
                        value={tc.expectedOutput}
                        onChange={(e) => handleTestCaseChange(idx, 'expectedOutput', e.target.value)}
                        placeholder="e.g. 6"
                        className="w-full p-2 font-mono text-xs rounded border border-border bg-background text-foreground resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Bottom Save / Publish Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => handleSubmit('DRAFT')}
          >
            Save as Draft
          </Button>
          <Button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit('PUBLISHED')}
            className="shadow-xs"
          >
            {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Publish Assignment'}
          </Button>
        </div>
      </div>
    </div>
  );
}
