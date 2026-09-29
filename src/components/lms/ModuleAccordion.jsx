import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  Code2,
  FileText,
  Video,
  ExternalLink,
  CheckCircle2,
  Circle,
  Clock,
} from 'lucide-react';

const LESSON_TYPE_ICONS = {
  ARTICLE: FileText,
  CODE_EXAMPLE: Code2,
  VIDEO: Video,
  DOCUMENT: BookOpen,
  RESOURCE: ExternalLink,
};

export function ModuleAccordion({
  curriculum = [],
  activeLessonId = null,
  onSelectLesson = null,
  showProgress = false,
  readOnly = false,
}) {
  // Track open module indices. Default all open if <= 3 modules
  const [openModules, setOpenModules] = useState(() => {
    const initial = {};
    curriculum.forEach((_, idx) => {
      initial[idx] = true;
    });
    return initial;
  });

  const toggleModule = (index) => {
    setOpenModules((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (!curriculum || curriculum.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-border rounded-lg">
        <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
        <p className="text-sm font-medium text-foreground">No curriculum modules authored yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Modules and lessons will appear here once published by the instructor.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {curriculum.map((mod, modIdx) => {
        const isOpen = !!openModules[modIdx];
        const lessons = mod.lessons || [];
        const completedCount = lessons.filter((l) => l.isCompleted).length;

        return (
          <div
            key={mod._id || modIdx}
            className="border border-border rounded-lg overflow-hidden bg-card transition-colors"
          >
            {/* Module Accordion Header */}
            <button
              type="button"
              onClick={() => toggleModule(modIdx)}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="p-1 rounded bg-background border border-border text-muted-foreground shrink-0">
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-primary" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-foreground truncate">
                    {mod.title}
                  </h4>
                  {mod.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {mod.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-xs font-mono text-muted-foreground">
                {showProgress && lessons.length > 0 && (
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded bg-background border border-border text-[11px]">
                    {completedCount} / {lessons.length} done
                  </span>
                )}
                <span>{lessons.length} Lessons</span>
              </div>
            </button>

            {/* Collapsible Lessons List */}
            {isOpen && (
              <div className="divide-y divide-border/60 border-t border-border/60">
                {lessons.length === 0 ? (
                  <div className="px-5 py-4 text-xs text-muted-foreground italic">
                    No lessons in this module yet.
                  </div>
                ) : (
                  lessons.map((lesson, lessonIdx) => {
                    const LessonIcon = LESSON_TYPE_ICONS[lesson.type] || FileText;
                    const isActive = activeLessonId && activeLessonId === lesson._id;

                    return (
                      <div
                        key={lesson._id || lessonIdx}
                        onClick={() => onSelectLesson && onSelectLesson(lesson)}
                        className={`px-4 py-3 flex items-center justify-between transition-colors ${
                          isActive
                            ? 'bg-primary/10 border-l-4 border-l-primary text-foreground font-medium'
                            : 'hover:bg-muted/30 text-muted-foreground hover:text-foreground'
                        } ${onSelectLesson ? 'cursor-pointer' : ''}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {showProgress ? (
                            lesson.isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                            )
                          ) : (
                            <LessonIcon className="w-4 h-4 text-primary shrink-0" />
                          )}

                          <div className="min-w-0">
                            <span className="text-xs font-medium text-foreground block truncate">
                              {lesson.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                              {lesson.type}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 pl-3">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{lesson.duration || 15} min</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
