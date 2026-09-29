import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Award,
  Download,
  Share2,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Building2,
  FileCheck2,
  Sparkles,
  Search,
  Filter,
  ShieldCheck,
} from 'lucide-react';

export default function StudentCertificatesPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCert, setSelectedCert] = useState(null);

  const certificates = [
    {
      id: 'CERT-CS101-2026-8842',
      title: 'CS101: Introduction to Computer Science & Python',
      courseCode: 'CS101',
      issuer: user?.university?.name || 'Meridian Institute of Technology',
      issueDate: 'August 15, 2026',
      grade: 'A+ (96.5%)',
      skills: ['Python 3.10', 'Algorithms', 'Data Structures', 'Docker Containers'],
      credentialUrl: 'https://unicodeide.edu/verify/CERT-CS101-2026-8842',
      status: 'VERIFIED',
      instructor: 'Prof. David Vance',
    },
    {
      id: 'CERT-DS201-2026-4419',
      title: 'CS201: Data Structures and Algorithmic Analysis',
      courseCode: 'CS201',
      issuer: user?.university?.name || 'Meridian Institute of Technology',
      issueDate: 'September 10, 2026',
      grade: 'A (92.0%)',
      skills: ['C++', 'Pointers', 'Graphs & Trees', 'Time Complexity'],
      credentialUrl: 'https://unicodeide.edu/verify/CERT-DS201-2026-4419',
      status: 'VERIFIED',
      instructor: 'Prof. Sarah Jenkins',
    },
  ];

  const inProgressTracks = [
    {
      title: 'CS301: Systems Programming & Docker Containerization',
      courseCode: 'CS301',
      progress: 68,
      estimatedCompletion: 'October 2026',
    },
  ];

  const filteredCerts = certificates.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2 sm:p-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <Award className="h-6 w-6 text-primary" />
            <span>Academic & Practical Certificates</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Cryptographically verifiable certificates issued upon completion of course tracks, practical labs, and coding assessments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() => alert('Certificate verification portal active on https://unicodeide.edu/verify')}
          >
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Verify Credentials</span>
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Award className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-foreground">{certificates.length}</div>
            <div className="text-xs text-muted-foreground">Issued Certificates</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-emerald-500">100%</div>
            <div className="text-xs text-muted-foreground">Tamper-Proof Verification</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-foreground">
              {inProgressTracks.length}
            </div>
            <div className="text-xs text-muted-foreground">In-Progress Credentials</div>
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm w-full">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search certificates by title, course, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCerts.map((cert) => (
          <Card
            key={cert.id}
            className="p-6 border-border hover:border-primary/50 transition-all flex flex-col justify-between gap-6 shadow-sm"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      {cert.courseCode}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      {cert.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground mt-2 leading-snug">
                    {cert.title}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-0.5">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground/70" />
                    <span>{cert.issuer}</span>
                  </p>
                </div>

                <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Award className="h-6 w-6 text-primary" />
                </div>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {cert.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted/70 text-muted-foreground border border-border"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/60 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Issued To</span>
                  <span className="font-medium text-foreground">{user?.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Final Grade</span>
                  <span className="font-bold text-emerald-500 font-mono">{cert.grade}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Issue Date</span>
                  <span className="text-foreground">{cert.issueDate}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Instructor</span>
                  <span className="text-foreground">{cert.instructor}</span>
                </div>
              </div>

              <div className="text-[10px] font-mono text-muted-foreground/70 break-all bg-muted/30 p-2 rounded border border-border/50">
                Credential ID: {cert.id}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-xs gap-1.5"
                onClick={() => {
                  navigator.clipboard.writeText(cert.credentialUrl);
                  alert('Verification link copied to clipboard!');
                }}
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Share Link</span>
              </Button>

              <Button
                size="sm"
                className="text-xs gap-1.5"
                onClick={() => {
                  window.print();
                }}
              >
                <Download className="h-3.5 w-3.5" />
                <span>Print / Download PDF</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* In-Progress Section */}
      {inProgressTracks.length > 0 && (
        <div className="pt-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider font-mono">
            Upcoming Credentials in Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inProgressTracks.map((track) => (
              <Card key={track.courseCode} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                    {track.courseCode}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    Est. {track.estimatedCompletion}
                  </span>
                </div>
                <div className="text-sm font-semibold text-foreground">{track.title}</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground font-mono">
                    <span>Course Track Progress</span>
                    <span>{track.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${track.progress}%` }}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
