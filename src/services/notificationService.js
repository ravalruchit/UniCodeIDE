// Notification Service - Real-time role-aware notifications with local storage persistence
const STORAGE_KEY_PREFIX = 'unicodeide_notifications_';

const DEFAULT_NOTIFICATIONS_BY_ROLE = {
  STUDENT: [
    {
      id: 'notif-s-1',
      title: 'Assignment Evaluated',
      message: 'Assignment 01 (Hello World & Variables) has been graded. Score: 95/100 (A+)!',
      type: 'GRADE',
      link: '/app/student/assignments',
      read: false,
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
    },
    {
      id: 'notif-s-2',
      title: 'Examination Scheduled',
      message: 'CS101 Midterm Examination window opens Friday at 10:00 AM.',
      type: 'EXAM',
      link: '/app/student/exams',
      read: false,
      timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
    },
    {
      id: 'notif-s-3',
      title: 'Academic Certificate Available',
      message: 'You completed CS101 course modules! Claim your verifiable certificate.',
      type: 'CERTIFICATE',
      link: '/app/student/certificates',
      read: false,
      timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // 1 day ago
    },
    {
      id: 'notif-s-4',
      title: 'Cloud Sandbox Online',
      message: 'Isolated container runtime grid active with 20 language environments.',
      type: 'SYSTEM',
      link: '/app/student/dashboard',
      read: true,
      timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), // 2 days ago
    },
  ],
  TEACHER: [
    {
      id: 'notif-t-1',
      title: 'New Student Submission',
      message: 'Alex Rivera submitted Assignment 01 solution for grading.',
      type: 'GRADE',
      link: '/app/teacher/assignments',
      read: false,
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif-t-2',
      title: 'Exam Proctoring Ready',
      message: 'CS101 Midterm live proctoring dashboard is ready for test monitoring.',
      type: 'EXAM',
      link: '/app/teacher/exams',
      read: false,
      timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    },
    {
      id: 'notif-t-3',
      title: 'Cohort Analytics Ready',
      message: 'Weekly academic performance and pass rate reports are ready for export.',
      type: 'SYSTEM',
      link: '/app/teacher/reports',
      read: true,
      timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    },
  ],
  UNIVERSITY_ADMIN: [
    {
      id: 'notif-ua-1',
      title: 'Department Sync Complete',
      message: 'Computer Science Department curriculum synced with 240 active seats.',
      type: 'SYSTEM',
      link: '/app/university-admin/dashboard',
      read: false,
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif-ua-2',
      title: 'Faculty Assessment Pending',
      message: '3 coding exams awaiting department dean scheduling confirmation.',
      type: 'EXAM',
      link: '/app/university-admin/dashboard',
      read: false,
      timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    },
  ],
  SUPER_ADMIN: [
    {
      id: 'notif-sa-1',
      title: 'Execution Engine Health',
      message: 'All 20 Docker containers and sandboxes verified operational.',
      type: 'SYSTEM',
      link: '/app/super-admin/health',
      read: false,
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif-sa-2',
      title: 'Enterprise Tenant Active',
      message: 'Meridian Institute of Technology tenant subscription verified.',
      type: 'SYSTEM',
      link: '/app/super-admin/dashboard',
      read: false,
      timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    },
  ],
};

const listeners = new Set();

function notifyListeners() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {
      // ignore listener error
    }
  });
}

export const notificationService = {
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  getStorageKey(role = 'STUDENT') {
    return `${STORAGE_KEY_PREFIX}${role.toUpperCase()}`;
  },

  getNotifications(role = 'STUDENT') {
    if (typeof localStorage === 'undefined') {
      return DEFAULT_NOTIFICATIONS_BY_ROLE[role] || DEFAULT_NOTIFICATIONS_BY_ROLE.STUDENT;
    }

    const key = this.getStorageKey(role);
    const raw = localStorage.getItem(key);
    if (!raw) {
      const defaults = DEFAULT_NOTIFICATIONS_BY_ROLE[role] || DEFAULT_NOTIFICATIONS_BY_ROLE.STUDENT;
      localStorage.setItem(key, JSON.stringify(defaults));
      return defaults;
    }

    try {
      const parsed = JSON.parse(raw);
      // Auto-migrate legacy or misspelled links
      let hasMigrated = false;
      const sanitized = parsed.map((n) => {
        if (n.link && n.link.includes('/app/univ-admin/')) {
          hasMigrated = true;
          return {
            ...n,
            link: n.link.replace('/app/univ-admin/', '/app/university-admin/'),
          };
        }
        return n;
      });

      if (hasMigrated && typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(sanitized));
      }

      return sanitized;
    } catch {
      return DEFAULT_NOTIFICATIONS_BY_ROLE[role] || DEFAULT_NOTIFICATIONS_BY_ROLE.STUDENT;
    }
  },

  getUnreadCount(role = 'STUDENT') {
    const list = this.getNotifications(role);
    return list.filter((n) => !n.read).length;
  },

  markAsRead(id, role = 'STUDENT') {
    const list = this.getNotifications(role);
    const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.getStorageKey(role), JSON.stringify(updated));
    }
    notifyListeners();
    return updated;
  },

  markAllAsRead(role = 'STUDENT') {
    const list = this.getNotifications(role);
    const updated = list.map((n) => ({ ...n, read: true }));
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.getStorageKey(role), JSON.stringify(updated));
    }
    notifyListeners();
    return updated;
  },

  deleteNotification(id, role = 'STUDENT') {
    const list = this.getNotifications(role);
    const updated = list.filter((n) => n.id !== id);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.getStorageKey(role), JSON.stringify(updated));
    }
    notifyListeners();
    return updated;
  },

  clearAll(role = 'STUDENT') {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.getStorageKey(role), JSON.stringify([]));
    }
    notifyListeners();
    return [];
  },

  addNotification(item, role = 'STUDENT') {
    const list = this.getNotifications(role);
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...item,
    };
    const updated = [newNotif, ...list];
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.getStorageKey(role), JSON.stringify(updated));
    }
    notifyListeners();
    return updated;
  },
};
