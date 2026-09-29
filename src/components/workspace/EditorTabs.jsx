import React from 'react';
import { X, FileCode, FileText, File } from 'lucide-react';

export function EditorTabs({
  openTabs,
  activeFilePath,
  unsavedPaths = new Set(),
  onSelectTab,
  onCloseTab,
}) {
  const getFileIcon = (filePath = '') => {
    const ext = filePath.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'py':
        return <FileCode className="h-3.5 w-3.5 text-sky-400 shrink-0" />;
      case 'js':
      case 'jsx':
        return <FileCode className="h-3.5 w-3.5 text-amber-400 shrink-0" />;
      case 'ts':
      case 'tsx':
        return <FileCode className="h-3.5 w-3.5 text-blue-400 shrink-0" />;
      case 'cpp':
      case 'c':
      case 'hpp':
      case 'h':
        return <FileCode className="h-3.5 w-3.5 text-indigo-400 shrink-0" />;
      case 'java':
        return <FileCode className="h-3.5 w-3.5 text-orange-400 shrink-0" />;
      case 'md':
        return <FileText className="h-3.5 w-3.5 text-emerald-400 shrink-0" />;
      default:
        return <File className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
    }
  };

  return (
    <div className="h-9 border-b border-border bg-card/20 flex items-center overflow-x-auto select-none no-scrollbar shrink-0">
      {openTabs.map((path) => {
        const isActive = activeFilePath === path;
        const isUnsaved = unsavedPaths.has(path);
        const fileName = path.split('/').pop();

        return (
          <div
            key={path}
            onClick={() => onSelectTab(path)}
            className={`group h-full flex items-center gap-2 px-3 border-r border-border text-xs cursor-pointer transition-colors max-w-[200px] shrink-0 ${
              isActive
                ? 'bg-background text-foreground font-medium border-t-2 border-t-primary'
                : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
            }`}
          >
            {getFileIcon(path)}
            <span className="truncate">{fileName}</span>

            {/* Unsaved dot or close icon */}
            <div className="flex items-center ml-1">
              {isUnsaved ? (
                <span
                  className="h-2 w-2 rounded-full bg-amber-500 group-hover:hidden"
                  title="Unsaved changes"
                />
              ) : null}

              {openTabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(path);
                  }}
                  className={`p-0.5 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground ${
                    isUnsaved ? 'hidden group-hover:block' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  title="Close Tab"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
