import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Building2,
  Search,
  Plus,
  Users,
  CheckCircle2,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';

export default function SuperAdminUniversitiesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const universities = [
    {
      id: 'UNI-001',
      name: 'Meridian Institute of Technology',
      code: 'MERIDIAN',
      domain: 'meridian.edu',
      tier: 'ENTERPRISE',
      campuses: 2,
      activeUsers: 480,
      status: 'ACTIVE',
      createdAt: '2026-01-10',
    },
    {
      id: 'UNI-002',
      name: 'Stanford Horizon Polytechnic',
      code: 'SHPOLY',
      domain: 'shpoly.edu',
      tier: 'ENTERPRISE',
      campuses: 1,
      activeUsers: 820,
      status: 'ACTIVE',
      createdAt: '2026-03-15',
    },
    {
      id: 'UNI-003',
      name: 'Cambridge Engineering Academy',
      code: 'CEA',
      domain: 'cea.edu',
      tier: 'STANDARD',
      campuses: 1,
      activeUsers: 340,
      status: 'ACTIVE',
      createdAt: '2026-05-20',
    },
  ];

  const filtered = universities.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2 sm:p-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <Building2 className="h-6 w-6 text-primary" />
            <span>Onboarded Universities & Tenants</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Global multi-tenant oversight, institutional provisioning, domain isolation, and license tiers.
          </p>
        </div>

        <Button
          size="sm"
          className="gap-2"
          onClick={() => alert('Onboard University modal opened.')}
        >
          <Plus className="h-4 w-4" />
          <span>Provision New Tenant</span>
        </Button>
      </div>

      <div className="relative max-w-sm w-full">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search tenants by name, code or domain..."
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
                <th className="px-5 py-3 font-semibold">University Tenant</th>
                <th className="px-5 py-3 font-semibold">Tenant Code</th>
                <th className="px-5 py-3 font-semibold">Domain</th>
                <th className="px-5 py-3 font-semibold">License Tier</th>
                <th className="px-5 py-3 font-semibold">Active Seats</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-foreground">{u.name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">ID: {u.id}</div>
                  </td>
                  <td className="px-5 py-3.5 font-mono font-bold text-primary">{u.code}</td>
                  <td className="px-5 py-3.5 font-mono text-muted-foreground">{u.domain}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-semibold">
                      {u.tier}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono">{u.activeUsers} Users</td>
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
