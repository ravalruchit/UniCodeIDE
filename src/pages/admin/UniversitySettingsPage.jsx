import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Settings, Save, CheckCircle2, Building2, Shield, Network } from 'lucide-react';

export default function UniversitySettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.university?.name || 'Meridian Institute of Technology');
  const [domain, setDomain] = useState('meridian.edu');
  const [labSubnet, setLabSubnet] = useState('10.14.0.0/16');
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-2 sm:p-6 text-left">
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
          <Settings className="h-6 w-6 text-primary" />
          <span>Campus & Institution Settings</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Configure university domain policies, campus computer lab networks, and institutional identity.
        </p>
      </div>

      {saved && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Institution settings updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider font-mono flex items-center gap-2 border-b border-border pb-3">
            <Building2 className="h-4 w-4 text-primary" />
            <span>Institution Profile</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">University / College Legal Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Authorized Email Domain</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="text-[10px] text-muted-foreground block">
                Students and faculty registering with this domain are automatically mapped to this university tenant.
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider font-mono flex items-center gap-2 border-b border-border pb-3">
            <Network className="h-4 w-4 text-primary" />
            <span>Lab Client Network Security</span>
          </h3>

          <div className="space-y-1.5 text-xs">
            <label className="font-semibold text-foreground">Campus Lab CIDR Subnet Whitelist</label>
            <input
              type="text"
              value={labSubnet}
              onChange={(e) => setLabSubnet(e.target.value)}
              className="w-full font-mono px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span className="text-[10px] text-muted-foreground block">
              Physical machines connecting through the Lab Client daemon must originate from these campus subnets.
            </span>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="sm" className="gap-2">
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
