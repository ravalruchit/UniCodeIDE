import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { StatCard } from '../../components/dashboard/StatCard';
import { QuickActions } from '../../components/dashboard/QuickActions';
import { RecentActivity } from '../../components/dashboard/RecentActivity';
import { EmptyState } from '../../components/dashboard/EmptyState';
import { Button } from '../../components/ui/Button';
import {
  Building2,
  Users,
  Activity,
  CreditCard,
  PlusCircle,
  ShieldCheck,
  Server,
  Radio,
  Clock
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const { user } = useAuth();

  const quickActions = [
    {
      title: 'Onboard University',
      description: 'Provision tenant, tenant code and admin account',
      icon: PlusCircle,
      onClick: () => alert('Onboard University module will be configured in Tenant Management Phase.'),
    },
    {
      title: 'Subscription Plans',
      description: 'Configure institutional tiers & billing',
      icon: CreditCard,
      onClick: () => alert('Billing module will be configured in Subscription Phase.'),
    },
    {
      title: 'Execution Grid',
      description: 'Inspect Piston runtime nodes & containers',
      icon: Server,
      onClick: () => alert('Piston cluster metrics will be wired in Execution Phase.'),
    },
    {
      title: 'Global Broadcast',
      description: 'Send maintenance alert to all campuses',
      icon: Radio,
      onClick: () => alert('Platform broadcast notifications will be wired in Messaging Phase.'),
    },
  ];

  const recentActivities = [
    {
      icon: Building2,
      description: 'New tenant provisioned: Meridian Institute of Technology (Code: MERIDIAN)',
      time: '2 hours ago',
      meta: 'Tenant ID: MIT-01',
    },
    {
      icon: ShieldCheck,
      description: 'Automated SOC2 compliance scan completed with 0 high vulnerabilities',
      time: '6 hours ago',
      meta: 'System Audit',
    },
    {
      icon: Activity,
      description: 'Piston Execution Grid node scale-out: 8 additional workers spun up',
      time: '14 hours ago',
      meta: 'Cluster Auto-scaling',
    },
  ];

  return (
    <div className="space-y-8">
      <DashboardHeader
        userName={user?.name || 'Platform Administrator'}
        subtitle="Global SaaS Platform Control Center · Multi-tenant oversight, billing, and system infrastructure."
        actions={
          <Button size="sm" className="gap-2">
            <PlusCircle className="h-4 w-4" /> Onboard University
          </Button>
        }
      />

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Campuses"
          value="12"
          subvalue="Institutions"
          icon={Building2}
          trend="+2 this month"
          badge="Multi-tenant"
        />
        <StatCard
          title="Total Platform Users"
          value="4,820"
          subvalue="Active Accounts"
          icon={Users}
          trend="+18.4% YoY"
          badge="Global"
        />
        <StatCard
          title="Runtime Execution Grid"
          value="99.98%"
          subvalue="Uptime SLA"
          icon={Activity}
          trend="Piston v2 Active"
          trendType="positive"
          badge="40+ Runtimes"
        />
        <StatCard
          title="Institutional MRR"
          value="$24,600"
          subvalue="Monthly"
          icon={CreditCard}
          trend="+12% renewals"
          badge="Enterprise"
        />
      </div>

      {/* Quick Action Tiles */}
      <QuickActions actions={quickActions} />

      {/* Main Grid: Activity Feed & Pending Approval Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity
            title="Global Infrastructure Audit Trail"
            activities={recentActivities}
          />
        </div>

        <div className="space-y-4 text-left">
          <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
            Campus Verification Queue
          </h3>
          <EmptyState
            icon={Clock}
            title="Zero pending university requests"
            description="All university onboarding applications and tenant verifications have been processed."
          />
        </div>
      </div>
    </div>
  );
}
