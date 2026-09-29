import React from 'react';
import { X, Sliders, Moon, Sun } from 'lucide-react';

export function WorkspaceSettingsModal({ isOpen, onClose, settings = {}, onUpdateSettings }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm text-foreground">Editor Preferences</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-4 text-sm">
          {/* Theme */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-foreground block">Editor Theme</span>
              <span className="text-xs text-muted-foreground">Monaco color scheme</span>
            </div>
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
              <button
                onClick={() => onUpdateSettings({ theme: 'vs-dark' })}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
                  settings.theme !== 'vs-light'
                    ? 'bg-background text-foreground shadow-sm font-medium'
                    : 'text-muted-foreground'
                }`}
              >
                <Moon className="h-3 w-3" />
                <span>Dark</span>
              </button>
              <button
                onClick={() => onUpdateSettings({ theme: 'vs-light' })}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
                  settings.theme === 'vs-light'
                    ? 'bg-background text-foreground shadow-sm font-medium'
                    : 'text-muted-foreground'
                }`}
              >
                <Sun className="h-3 w-3" />
                <span>Light</span>
              </button>
            </div>
          </div>

          {/* Font Size */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-foreground block">Font Size</span>
              <span className="text-xs text-muted-foreground">Code editor text scaling</span>
            </div>
            <select
              value={settings.fontSize || 14}
              onChange={(e) => onUpdateSettings({ fontSize: Number(e.target.value) })}
              className="bg-background border border-border rounded-md px-2.5 py-1 text-xs text-foreground outline-none"
            >
              <option value={12}>12 px</option>
              <option value={14}>14 px (Default)</option>
              <option value={16}>16 px</option>
              <option value={18}>18 px</option>
              <option value={20}>20 px</option>
            </select>
          </div>

          {/* Tab Size */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-foreground block">Tab Size</span>
              <span className="text-xs text-muted-foreground">Indentation spaces</span>
            </div>
            <select
              value={settings.tabSize || 4}
              onChange={(e) => onUpdateSettings({ tabSize: Number(e.target.value) })}
              className="bg-background border border-border rounded-md px-2.5 py-1 text-xs text-foreground outline-none"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces (Default)</option>
            </select>
          </div>

          {/* Word Wrap */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-foreground block">Word Wrap</span>
              <span className="text-xs text-muted-foreground">Soft-wrap long lines</span>
            </div>
            <button
              onClick={() =>
                onUpdateSettings({ wordWrap: settings.wordWrap === 'on' ? 'off' : 'on' })
              }
              className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                settings.wordWrap === 'on'
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-muted text-muted-foreground border-border'
              }`}
            >
              {settings.wordWrap === 'on' ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Minimap */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-foreground block">Code Minimap</span>
              <span className="text-xs text-muted-foreground">Overview scrollbar on right</span>
            </div>
            <button
              onClick={() => onUpdateSettings({ minimap: !settings.minimap })}
              className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                settings.minimap !== false
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-muted text-muted-foreground border-border'
              }`}
            >
              {settings.minimap !== false ? 'Shown' : 'Hidden'}
            </button>
          </div>
        </div>

        <div className="p-3 bg-muted/30 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
