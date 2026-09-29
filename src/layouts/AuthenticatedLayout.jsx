import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Topbar } from '../components/dashboard/Topbar';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

export default function AuthenticatedLayout() {
  const location = useLocation();
  const isWorkspace = location.pathname.includes('/workspace');

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-collapse sidebar when entering IDE workspace to give full screen width
  useEffect(() => {
    if (isWorkspace) {
      setCollapsed(true);
    }
  }, [isWorkspace]);

  return (
    <div className="h-screen w-screen flex bg-background text-foreground antialiased selection:bg-primary/20 overflow-hidden">
      {/* Role-specific Sidebar with Desktop/Tablet/Mobile behaviors */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {!isWorkspace && <Topbar onToggleMobile={() => setMobileOpen(!mobileOpen)} />}
        <main
          className={
            isWorkspace
              ? 'flex-1 min-w-0 h-full overflow-hidden p-0'
              : 'flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto'
          }
        >
          <div className={isWorkspace ? 'h-full w-full' : 'mx-auto max-w-7xl'}>
            <ErrorBoundary>
              <Outlet context={{ collapsed, setCollapsed, isWorkspace }} />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
