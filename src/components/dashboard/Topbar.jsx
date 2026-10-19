import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../navigation/ThemeToggle';
import { ROLE_CONFIG } from '../../auth/roles';
import { notificationService } from '../../services/notificationService';
import {
  Menu,
  Bell,
  LogOut,
  User,
  ChevronDown,
  Building,
  CheckCircle2,
  ShieldAlert,
  Award,
  Calendar,
  Sparkles,
  Trash2,
  Check,
  ArrowRight
} from 'lucide-react';

export function Topbar({ onToggleMobile }) {
  const { user, role, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState('ALL');
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  const roleConfig = ROLE_CONFIG[role] || { name: 'User', badgeColor: 'bg-muted text-muted-foreground' };

  // Sync notifications from notificationService
  useEffect(() => {
    const load = () => {
      setNotifications(notificationService.getNotifications(role));
    };
    load();
    const unsub = notificationService.subscribe(load);
    return unsub;
  }, [role]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const displayedNotifications = useMemo(() => {
    if (notifFilter === 'UNREAD') {
      return notifications.filter((n) => !n.read);
    }
    return notifications;
  }, [notifications, notifFilter]);

  // Format relative time
  const formatTime = (isoString) => {
    try {
      const diff = Math.max(0, Date.now() - new Date(isoString).getTime());
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return '';
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'GRADE':
        return <Award className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />;
      case 'EXAM':
        return <Calendar className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />;
      case 'CERTIFICATE':
        return <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />;
      case 'SYSTEM':
      default:
        return <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />;
    }
  };

  const handleNotificationClick = (notif) => {
    notificationService.markAsRead(notif.id, role);
    setNotificationsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleMarkAllRead = () => {
    notificationService.markAllAsRead(role);
  };

  const handleClearAll = () => {
    notificationService.clearAll(role);
  };

  const handleDeleteItem = (e, id) => {
    e.stopPropagation();
    notificationService.deleteNotification(id, role);
  };

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
            {unreadCount > 0 ? (
              <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center shadow">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            ) : null}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card shadow-2xl z-50 animate-fade-up text-left overflow-hidden">
              {/* Header */}
              <div className="p-3 border-b border-border bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-primary/20 text-primary font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-primary hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Check className="h-3 w-3" />
                      Mark read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="text-[11px] text-muted-foreground hover:text-destructive cursor-pointer"
                      title="Clear all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="px-3 py-1.5 border-b border-border/60 bg-muted/10 flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setNotifFilter('ALL')}
                  className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    notifFilter === 'ALL'
                      ? 'bg-accent text-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setNotifFilter('UNREAD')}
                  className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    notifFilter === 'UNREAD'
                      ? 'bg-accent text-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
                {displayedNotifications.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-xs space-y-1">
                    <CheckCircle2 className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                    <p className="font-medium text-foreground">You are all caught up!</p>
                    <p className="text-[11px]">No notifications to display right now.</p>
                  </div>
                ) : (
                  displayedNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3 transition-colors hover:bg-accent/40 cursor-pointer flex items-start gap-2.5 relative group ${
                        !notif.read ? 'bg-primary/5' : ''
                      }`}
                    >
                      {!notif.read && (
                        <span className="absolute left-1.5 top-4 h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                      <div className="pl-1 shrink-0">{getNotifIcon(notif.type)}</div>
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-xs font-semibold truncate ${!notif.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                            {formatTime(notif.timestamp)}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteItem(e, notif.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive rounded transition-opacity"
                        title="Dismiss"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {displayedNotifications.length > 0 && (
                <div className="p-2 border-t border-border bg-muted/20 text-center">
                  <span className="text-[10px] text-muted-foreground">
                    Click any notification to navigate directly to its page
                  </span>
                </div>
              )}
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
