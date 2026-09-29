import React, { useState } from 'react';
import {
  FileCode,
  Folder,
  FolderOpen,
  Plus,
  Trash2,
  Edit2,
  FilePlus,
  FolderPlus,
  ChevronRight,
  ChevronDown,
  FileText,
  File,
} from 'lucide-react';

export function FileExplorer({
  files,
  activeFilePath,
  onSelectFile,
  onCreateFile,
  onCreateFolder,
  onRenameFile,
  onDeleteFile,
}) {
  const [collapsedFolders, setCollapsedFolders] = useState({});
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newPathInput, setNewPathInput] = useState('');
  const [renamingPath, setRenamingPath] = useState(null);
  const [renameInput, setRenameInput] = useState('');

  const toggleFolder = (folderPath) => {
    setCollapsedFolders((prev) => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }));
  };

  const getFileIcon = (fileName = '') => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'py':
        return <FileCode className="h-4 w-4 text-sky-400 shrink-0" />;
      case 'js':
      case 'jsx':
        return <FileCode className="h-4 w-4 text-amber-400 shrink-0" />;
      case 'ts':
      case 'tsx':
        return <FileCode className="h-4 w-4 text-blue-400 shrink-0" />;
      case 'cpp':
      case 'c':
      case 'hpp':
      case 'h':
        return <FileCode className="h-4 w-4 text-indigo-400 shrink-0" />;
      case 'java':
        return <FileCode className="h-4 w-4 text-orange-400 shrink-0" />;
      case 'md':
        return <FileText className="h-4 w-4 text-emerald-400 shrink-0" />;
      default:
        return <File className="h-4 w-4 text-muted-foreground shrink-0" />;
    }
  };

  // Build virtual tree structure from flat file paths
  const buildTree = () => {
    const root = { files: [], folders: {} };

    files.forEach((file) => {
      const parts = file.path.split('/');
      if (parts.length === 1) {
        root.files.push(file);
      } else {
        let currentFolder = root;
        let currentPath = '';

        for (let i = 0; i < parts.length - 1; i++) {
          const folderName = parts[i];
          currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;

          if (!currentFolder.folders[folderName]) {
            currentFolder.folders[folderName] = {
              name: folderName,
              path: currentPath,
              files: [],
              folders: {},
            };
          }
          currentFolder = currentFolder.folders[folderName];
        }
        currentFolder.files.push(file);
      }
    });

    return root;
  };

  const tree = buildTree();

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const trimmed = newPathInput.trim().replace(/^\/+|\/+$/g, '');
    if (!trimmed) return;

    if (isCreatingFile) {
      onCreateFile(trimmed);
    } else if (isCreatingFolder) {
      // Create folder by placing a placeholder file or user-defined entry
      onCreateFile(`${trimmed}/main.py`);
    }

    setNewPathInput('');
    setIsCreatingFile(false);
    setIsCreatingFolder(false);
  };

  const handleRenameSubmit = (e, oldPath) => {
    e.preventDefault();
    const trimmed = renameInput.trim().replace(/^\/+|\/+$/g, '');
    if (trimmed && trimmed !== oldPath) {
      onRenameFile(oldPath, trimmed);
    }
    setRenamingPath(null);
    setRenameInput('');
  };

  const renderFolder = (folder) => {
    const isCollapsed = collapsedFolders[folder.path];

    return (
      <div key={folder.path} className="space-y-0.5">
        <div
          onClick={() => toggleFolder(folder.path)}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-foreground/80 hover:bg-muted/60 cursor-pointer font-medium select-none group"
        >
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          )}
          {isCollapsed ? (
            <Folder className="h-4 w-4 text-amber-500 shrink-0" />
          ) : (
            <FolderOpen className="h-4 w-4 text-amber-500 shrink-0" />
          )}
          <span className="truncate">{folder.name}</span>
        </div>

        {!isCollapsed && (
          <div className="pl-4 border-l border-border/40 ml-3 space-y-0.5">
            {Object.values(folder.folders).map((sub) => renderFolder(sub))}
            {folder.files.map((file) => renderFile(file))}
          </div>
        )}
      </div>
    );
  };

  const renderFile = (file) => {
    const isActive = activeFilePath === file.path;
    const isRenaming = renamingPath === file.path;

    if (isRenaming) {
      return (
        <form
          key={file.path}
          onSubmit={(e) => handleRenameSubmit(e, file.path)}
          className="px-2 py-0.5"
        >
          <input
            autoFocus
            type="text"
            value={renameInput}
            onChange={(e) => setRenameInput(e.target.value)}
            onBlur={() => setRenamingPath(null)}
            className="w-full bg-background border border-primary text-xs px-1.5 py-0.5 rounded text-foreground outline-none"
          />
        </form>
      );
    }

    return (
      <div
        key={file.path}
        onClick={() => onSelectFile(file.path)}
        className={`group flex items-center justify-between gap-2 px-2 py-1 rounded text-xs cursor-pointer select-none transition-colors ${
          isActive
            ? 'bg-primary/15 text-primary font-medium'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
        }`}
      >
        <div className="flex items-center gap-2 truncate min-w-0">
          {getFileIcon(file.name)}
          <span className="truncate">{file.name}</span>
          {file.isEntry && (
            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-muted/80 text-muted-foreground">
              entry
            </span>
          )}
        </div>

        {/* Action icons on hover */}
        <div className="hidden group-hover:flex items-center gap-1 opacity-80">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setRenamingPath(file.path);
              setRenameInput(file.path);
            }}
            className="p-1 hover:text-foreground rounded"
            title="Rename"
          >
            <Edit2 className="h-3 w-3" />
          </button>
          {files.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Delete "${file.path}"?`)) {
                  onDeleteFile(file.path);
                }
              }}
              className="p-1 hover:text-rose-500 rounded"
              title="Delete File"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-56 h-full flex flex-col bg-card/40 border-r border-border select-none shrink-0 text-left">
      {/* File Explorer Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Explorer
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setIsCreatingFile(true);
              setIsCreatingFolder(false);
              setNewPathInput('');
            }}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="New File"
          >
            <FilePlus className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setIsCreatingFolder(true);
              setIsCreatingFile(false);
              setNewPathInput('');
            }}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="New Folder"
          >
            <FolderPlus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Inline Create Input */}
      {(isCreatingFile || isCreatingFolder) && (
        <form onSubmit={handleCreateSubmit} className="p-2 border-b border-border/50">
          <input
            autoFocus
            type="text"
            placeholder={isCreatingFile ? 'filename.py' : 'foldername'}
            value={newPathInput}
            onChange={(e) => setNewPathInput(e.target.value)}
            onBlur={() => {
              if (!newPathInput.trim()) {
                setIsCreatingFile(false);
                setIsCreatingFolder(false);
              }
            }}
            className="w-full bg-background border border-primary text-xs px-2 py-1 rounded text-foreground outline-none"
          />
        </form>
      )}

      {/* File & Folder Tree */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {Object.values(tree.folders).map((folder) => renderFolder(folder))}
        {tree.files.map((file) => renderFile(file))}
      </div>
    </div>
  );
}
