import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ROLE_CONFIG, ROLES } from '../../auth/roles';
import {
  User,
  Mail,
  Building2,
  Shield,
  Key,
  CheckCircle2,
  Terminal,
  Clock,
  Sparkles,
  Save,
  Laptop,
  Layers,
  GraduationCap,
} from 'lucide-react';

export default function UserProfilePage() {
  const { user, role } = useAuth();
  const roleConfig = ROLE_CONFIG[role] || ROLE_CONFIG[ROLES.STUDENT];

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(
    user?.bio ||
      (role === ROLES.STUDENT
        ? 'Passionate software engineering undergraduate focusing on systems programming and algorithmic performance.'
        : 'Faculty instructor committed to advancing practical computer science education.')
  );
  const [preferredLanguage, setPreferredLanguage] = useState(
    user?.preferredLanguage || 'PYTHON'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-2 sm:p-6 text-left">
      {/* Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
          <User className="h-6 w-6 text-primary" />
          <span>User Profile & Account Settings</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your personal information, institutional affiliation, workspace preferences, and security credentials.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Profile preferences updated successfully!</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <Card className="p-6 bg-gradient-to-br from-card via-card to-muted/20 border-border">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="h-20 w-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-2xl font-bold font-mono shrink-0 shadow-inner">
            {user?.name
              ? user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase()
              : 'ID'}
          </div>

          <div className="space-y-2 flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-foreground">{user?.name || 'Authorized User'}</h2>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${roleConfig.badgeColor}`}
              >
                {roleConfig.name}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                <span>{user?.email || 'user@unicodeide.edu'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                <span>{user?.university?.name || 'Meridian Institute of Technology'}</span>
              </span>
              {user?.department && (
                <span className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" />
                  <span>{user.department}</span>
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground/80 max-w-2xl leading-relaxed pt-1">
              {bio}
            </p>
          </div>
        </div>
      </Card>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Edit Profile */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-5">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider font-mono border-b border-border pb-3">
              Personal Information
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Email Address</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 rounded-lg border border-border bg-muted/40 text-muted-foreground cursor-not-allowed"
                />
                <span className="text-[10px] text-muted-foreground">
                  Institutional email address managed by your university domain administrator.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Biography & Research Focus</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Default Programming Language</label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="PYTHON">Python 3.10 (Piston Sandbox)</option>
                  <option value="JAVASCRIPT">JavaScript / Node.js 18</option>
                  <option value="TYPESCRIPT">TypeScript 5.0</option>
                  <option value="CPP">C++ 17 (GCC 12)</option>
                  <option value="JAVA">Java 17 OpenJDK</option>
                  <option value="C">C (GCC 12)</option>
                </select>
                <span className="text-[10px] text-muted-foreground">
                  Pre-selects language template when initializing cloud workspaces.
                </span>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" size="sm" className="gap-2">
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Info: Security & Lab Client Status */}
        <div className="space-y-6">
          <Card className="p-5 space-y-4">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Authentication & Security</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-border/60">
                <span className="text-muted-foreground">Auth Role</span>
                <span className="font-mono font-semibold text-foreground">{role}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/60">
                <span className="text-muted-foreground">Tenant Isolation</span>
                <span className="text-emerald-500 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/60">
                <span className="text-muted-foreground">Session Token</span>
                <span className="font-mono text-[10px] text-muted-foreground">JWT Bearer (24h)</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">2FA Verification</span>
                <span className="text-muted-foreground">Optional</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono flex items-center gap-2">
              <Laptop className="h-4 w-4 text-primary" />
              <span>Desktop Lab Integration</span>
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              When logged into a physical campus computer lab device, your workspace pairs via the UniCode Lab Client daemon (Phase 9).
            </p>

            <div className="p-3 rounded-lg border border-border bg-muted/30 text-[11px] space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lab Mode:</span>
                <span className="text-foreground font-semibold">Web Browser</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Heartbeat:</span>
                <span className="text-emerald-500">Connected</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
