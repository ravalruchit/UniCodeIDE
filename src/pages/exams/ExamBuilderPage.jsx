import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { examService } from '../../services/examService';
import { lmsService } from '../../services/lmsService';
import {
  FileCode2,
  Save,
  Plus,
  Trash2,
  ArrowLeft,
  Shield,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export function ExamBuilderPage() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [questionsBank, setQuestionsBank] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    courseId: '',
    description: '',
    instructions: 'Follow standard examination integrity guidelines.',
    durationMinutes: 60,
    passingMarks: 40,
    maxAttempts: 1,
    randomizeQuestions: false,
    autoSubmit: true,
    allowStudentExecution: true,
    allowTerminal: false,
    requireFullscreen: false,
    proctoringMode: 'BASIC',
    questions: [],
  });

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [cRes, qRes] = await Promise.all([
          lmsService.getCourses(),
          examService.getQuestions(),
        ]);

        if (cRes?.courses) setCourses(cRes.courses);
        if (qRes?.questions) setQuestionsBank(qRes.questions);

        if (cRes?.courses?.length > 0 && !formData.courseId) {
          setFormData((prev) => ({ ...prev, courseId: cRes.courses[0]._id }));
        }

        if (examId) {
          const exRes = await examService.getExamById(examId);
          if (exRes?.exam) {
            setFormData({
              title: exRes.exam.title,
              courseId: exRes.exam.courseId?._id || exRes.exam.courseId,
              description: exRes.exam.description,
              instructions: exRes.exam.instructions,
              durationMinutes: exRes.exam.durationMinutes,
              passingMarks: exRes.exam.passingMarks,
              maxAttempts: exRes.exam.maxAttempts,
              randomizeQuestions: exRes.exam.randomizeQuestions,
              autoSubmit: exRes.exam.autoSubmit,
              allowStudentExecution: exRes.exam.allowStudentExecution,
              allowTerminal: exRes.exam.allowTerminal,
              requireFullscreen: exRes.exam.requireFullscreen,
              proctoringMode: exRes.exam.proctoringMode,
              questions: exRes.exam.questions || [],
            });
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to initialize builder');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [examId]);

  const handleAddQuestionFromBank = (qbItem) => {
    if (formData.questions.some((q) => q.questionId === qbItem._id)) return;
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          questionId: qbItem._id,
          order: prev.questions.length + 1,
          marks: qbItem.marks || 10,
          isRequired: true,
          snapshot: {
            title: qbItem.title,
            description: qbItem.description,
            difficulty: qbItem.difficulty,
          },
        },
      ],
    }));
  };

  const handleRemoveQuestion = (index) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, idx) => idx !== index),
    }));
  };

  const handleSave = async (publish = false) => {
    if (!formData.title || !formData.courseId) {
      setError('Please provide an exam title and select a course.');
      return;
    }

    if (publish && formData.questions.length === 0) {
      setError('Cannot publish an exam without attaching questions.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let savedExamId = examId;
      if (examId) {
        await examService.updateExam(examId, formData);
      } else {
        const res = await examService.createExam(formData);
        savedExamId = res.exam._id;
      }

      if (publish && savedExamId) {
        await examService.publishExam(savedExamId);
      }

      navigate('/app/teacher/exams');
    } catch (err) {
      setError(err.message || 'Failed to save examination');
    } finally {
      setSaving(false);
    }
  };

  const totalCalculatedMarks = formData.questions.reduce((sum, q) => sum + (Number(q.marks) || 10), 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 text-left">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app/teacher/exams')}
            className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {examId ? 'Edit Examination' : 'Author New Examination'}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Configure timing, proctoring signals, coding questions, and publish.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium border border-border bg-background hover:bg-muted text-foreground transition-colors shadow-sm"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Publish Exam</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: General Details & Timing */}
        <div className="md:col-span-2 space-y-5">
          <div className="p-5 rounded-xl border border-border bg-card space-y-4">
            <h3 className="font-semibold text-sm text-foreground">General Examination Information</h3>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Exam Title</label>
              <input
                type="text"
                placeholder="e.g. CS101 Midterm Examination"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Course</label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Duration (Minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="360"
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value, 10) || 60 })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Description & Instructions</label>
              <textarea
                rows={3}
                placeholder="Instructions displayed to students before starting..."
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Attached Questions */}
          <div className="p-5 rounded-xl border border-border bg-card space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div className="flex items-center gap-2">
                <FileCode2 className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm text-foreground">Attached Coding Questions</h3>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                Total Marks: <strong className="text-foreground">{totalCalculatedMarks}</strong>
              </span>
            </div>

            {formData.questions.length > 0 ? (
              <div className="space-y-2">
                {formData.questions.map((q, idx) => {
                  const qb = questionsBank.find((item) => item._id === q.questionId) || q.snapshot || {};
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary">Q{idx + 1}</span>
                        <span className="font-medium text-foreground">{qb.title || 'Coding Problem'}</span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {qb.difficulty || 'MEDIUM'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Marks:</span>
                          <input
                            type="number"
                            min="1"
                            value={q.marks}
                            onChange={(e) => {
                              const newQuestions = [...formData.questions];
                              newQuestions[idx].marks = parseInt(e.target.value, 10) || 10;
                              setFormData({ ...formData, questions: newQuestions });
                            }}
                            className="w-14 px-1.5 py-0.5 rounded border border-border bg-background text-center font-mono text-xs"
                          />
                        </div>

                        <button
                          onClick={() => handleRemoveQuestion(idx)}
                          className="p-1 rounded text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No questions attached yet. Select problems from the Question Bank on the right.
              </p>
            )}
          </div>
        </div>

        {/* Right: Rules, Proctoring & Bank Selector */}
        <div className="space-y-5">
          {/* Proctoring Settings */}
          <div className="p-5 rounded-xl border border-border bg-card space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-2 text-foreground font-semibold text-xs">
              <Shield className="h-4 w-4 text-primary" />
              <span>Proctoring & Rules Policy</span>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-foreground">Proctoring Level</label>
              <select
                value={formData.proctoringMode}
                onChange={(e) => setFormData({ ...formData, proctoringMode: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground"
              >
                <option value="NONE">None (Unmonitored)</option>
                <option value="BASIC">Basic (Tabs, Focus, Network)</option>
                <option value="STRICT">Strict (Fullscreen Required)</option>
              </select>
            </div>

            <div className="space-y-2 pt-2 border-t border-border text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requireFullscreen}
                  onChange={(e) => setFormData({ ...formData, requireFullscreen: e.target.checked })}
                  className="rounded border-border text-primary"
                />
                <span>Require Fullscreen</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowStudentExecution}
                  onChange={(e) => setFormData({ ...formData, allowStudentExecution: e.target.checked })}
                  className="rounded border-border text-primary"
                />
                <span>Allow Code Execution & Tests</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.autoSubmit}
                  onChange={(e) => setFormData({ ...formData, autoSubmit: e.target.checked })}
                  className="rounded border-border text-primary"
                />
                <span>Auto-Submit on Deadline</span>
              </label>
            </div>
          </div>

          {/* Question Bank Browser */}
          <div className="p-5 rounded-xl border border-border bg-card space-y-3">
            <h3 className="font-semibold text-xs text-foreground">Add from Question Bank</h3>

            {questionsBank.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {questionsBank.map((qb) => {
                  const isAdded = formData.questions.some((q) => q.questionId === qb._id);
                  return (
                    <div
                      key={qb._id}
                      className="p-2.5 rounded-lg border border-border bg-muted/20 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-medium text-foreground line-clamp-1">{qb.title}</p>
                        <span className="text-[10px] text-muted-foreground font-mono">{qb.difficulty} • {qb.marks}m</span>
                      </div>

                      <button
                        onClick={() => handleAddQuestionFromBank(qb)}
                        disabled={isAdded}
                        className="px-2 py-1 rounded text-[11px] font-medium border border-border hover:bg-muted disabled:opacity-40"
                      >
                        {isAdded ? 'Added' : 'Add +'}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground">No questions in library.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
