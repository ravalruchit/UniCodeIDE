import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

export function CodeEditor({
  filePath = 'main.py',
  content = '',
  onChange,
  settings = {},
  onSave,
}) {
  const editorRef = useRef(null);

  const getMonacoLanguage = (path = '') => {
    const ext = path.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'py':
        return 'python';
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'cpp':
      case 'c':
      case 'hpp':
      case 'h':
        return 'cpp';
      case 'java':
        return 'java';
      case 'cs':
        return 'csharp';
      case 'go':
        return 'go';
      case 'rs':
        return 'rust';
      case 'sql':
        return 'sql';
      case 'php':
        return 'php';
      case 'rb':
        return 'ruby';
      case 'kt':
        return 'kotlin';
      case 'swift':
        return 'swift';
      case 'dart':
        return 'dart';
      case 'r':
        return 'r';
      case 'sh':
      case 'bash':
        return 'shell';
      case 'scala':
        return 'scala';
      case 'lua':
        return 'lua';
      case 'pl':
      case 'pm':
        return 'perl';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      default:
        return 'plaintext';
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Add Ctrl/Cmd + S action to editor
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (onSave) {
        onSave();
      }
    });
  };

  return (
    <div className="flex-1 w-full h-full relative overflow-hidden bg-background">
      <Editor
        height="100%"
        path={filePath}
        language={getMonacoLanguage(filePath)}
        value={content}
        theme={settings.theme === 'vs-light' ? 'light' : 'vs-dark'}
        onChange={(val) => onChange && onChange(val || '')}
        onMount={handleEditorDidMount}
        options={{
          fontSize: settings.fontSize || 14,
          tabSize: settings.tabSize || 4,
          wordWrap: settings.wordWrap || 'on',
          minimap: { enabled: settings.minimap !== false },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
          fontLigatures: true,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          renderLineHighlight: 'all',
          lineNumbers: 'on',
          padding: { top: 12, bottom: 12 },
        }}
        loading={
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
            Initializing Monaco Cloud Editor...
          </div>
        }
      />
    </div>
  );
}
