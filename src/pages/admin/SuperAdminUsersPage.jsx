import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Users, Search, Shield, Building2, CheckCircle2, UserCheck } from 'lucide-react';

export default function SuperAdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const users = [
    {
      id: 'USR-01',
      name: 'System Root Admin',
      email: 'admin@unicodeide.io',
      role: 'SUPER_ADMIN',
      university: 'Global Platform',
      status: 'ACTIVE',
    },
    {
      id: 'USR-02',
      name: 'Dr. Arthur Pendelton',
      email: 'admin@meridian.edu',
      role: 'UNIVERSITY_ADMIN',
      university: 'Meridian Institute of Technology',
      status: 'ACTIVE',
    },
    {
      id: 'USR-03',
      name: 'Prof. David Vance',
      email: 'david.vance@meridian.edu',
      role: 'TEACHER',
      university: 'Meridian Institute of Technology',
      status: 'ACTIVE',
    },
    {
      id: 'USR-04',
      name: 'Alex Rivera',
      email: 'alex.rivera@meridian.edu',
      role: 'STUDENT',
      university: 'Meridian Institute of Technology',
      status: 'ACTIVE',
    },
  ];

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.university.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2 sm:p-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <Users className="h-6 w-6 text-primary" />
            <span>Global Users & Role Access</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Platform-wide cross-tenant user accounts, RBAC role overrides, and authentication logs.
          </p>
        </div>
      </div>

      <div className="relative max-w-sm w-full">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search global users by name, email, role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/30 border-b border-border text-muted-foreground font-mono uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 font-semibold">User</th>
                <th className="px-5 py-3 font-semibold">Assigned Role</th>
                <th className="px-5 py-3 font-semibold">Tenant Organization</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-foreground">{u.name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{u.email}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-semibold">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{u.university}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold">
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
