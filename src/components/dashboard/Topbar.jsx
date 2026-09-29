import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../navigation/ThemeToggle';
import { ROLE_CONFIG } from '../../auth/roles';
import {
  Menu,
  Bell,
  LogOut,
  User,
  ChevronDown,
  Building,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

export function Topbar({ onToggleMobile }) {
  const { user, role, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  const roleConfig = ROLE_CONFIG[role] || { name: 'User', badgeColor: 'bg-muted text-muted-foreground' };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : parts[0][0].toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 h-14 bg-background/95 backdrop-blur border-b border-border px-4 sm:px-6 flex items-center justify-between select-none">
      {/* Left: Mobile Toggle & Context */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onToggleMobile}
          className="md:hidden p-1.5 rounded-md border border-border text-foreground hover:bg-accent cursor-pointer"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-2 text-sm">
          <span className="font-semibold text-foreground hidden sm:inline">
            {roleConfig.name} Portal
          </span>
          <span className="text-muted-foreground hidden sm:inline">/</span>
          <span className="text-xs text-muted-foreground font-mono">
            {user?.department || 'Overview'}
          </span>
        </div>
      </div>

      {/* Right: Controls & User Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications Icon & Popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-card p-4 shadow-xl z-50 animate-fade-up text-left">
              <div className="flex items-center justify-between pb-2 border-b border-border mb-3">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                  Notifications
                </span>
                <span className="text-[10px] text-primary hover:underline cursor-pointer">
                  Mark all read
                </span>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-start space-x-2.5 text-xs">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-foreground">Cloud IDE Execution Grid online</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Piston runtimes active · 10m ago</div>
                  </div>
                </div>
                <div className="flex items-start space-x-2.5 text-xs">
                  <ShieldAlert className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-foreground">Scheduled proctoring window</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">CS101 Midterm scheduled for Friday</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center space-x-2.5 p-1 rounded-full sm:rounded-md hover:bg-accent/60 transition-colors cursor-pointer"
            aria-label="User menu"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-8 w-8 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary/20 text-primary font-mono text-xs font-bold flex items-center justify-center border border-primary/30">
                {getInitials(user?.name)}
              </div>
            )}

            <div className="hidden sm:block text-left text-xs">
              <div className="font-semibold text-foreground truncate max-w-[120px]">{user?.name || 'User'}</div>
              <div className="text-[10px] text-muted-foreground font-mono">{roleConfig.shortName}</div>
            </div>

            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-card p-3 shadow-xl z-50 animate-fade-up text-left">
              {/* Account summary */}
              <div className="px-2 py-2 border-b border-border mb-2">
                <div className="font-semibold text-sm text-foreground truncate">{user?.name}</div>
                <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold ${roleConfig.badgeColor}`}>
                    {roleConfig.name}
                  </span>
                  {user?.university?.code && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border bg-muted text-muted-foreground">
                      {user.university.code}
                    </span>
                  )}
                </div>
              </div>

              {/* Navigation options */}
              <div className="space-y-1">
                <div className="px-2 py-1.5 text-xs text-muted-foreground flex items-center space-x-2 rounded hover:bg-accent/60 cursor-pointer">
                  <User className="h-3.5 w-3.5" />
                  <span>Account Settings</span>
                </div>
                {user?.university?.name && (
                  <div className="px-2 py-1.5 text-xs text-muted-foreground flex items-center space-x-2 rounded hover:bg-accent/60 cursor-pointer">
                    <Building className="h-3.5 w-3.5" />
                    <span className="truncate">{user.university.name}</span>
                  </div>
                )}
              </div>

              {/* Sign out button */}
              <div className="pt-2 mt-2 border-t border-border">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-2 py-1.5 text-xs text-rose-500 hover:bg-rose-500/10 rounded flex items-center space-x-2 font-medium transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign out of session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
