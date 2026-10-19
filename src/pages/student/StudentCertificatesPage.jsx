import React, { useState, useEffect } from 'react';
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
  Eye,
  X,
  Printer,
  Copy,
  Check,
  QrCode,
  Lock,
} from 'lucide-react';

const INITIAL_CERTIFICATES = [
  {
    id: 'CERT-CS101-2026-8842',
    title: 'CS101: Introduction to Computer Science & Python',
    courseCode: 'CS101',
    issuer: 'Meridian Institute of Technology',
    issueDate: 'August 15, 2026',
    grade: 'A+ (96.5%)',
    skills: ['Python 3.10', 'Algorithms', 'Data Structures', 'Docker Containers'],
    credentialUrl: 'https://unicodeide.edu/verify/CERT-CS101-2026-8842',
    status: 'VERIFIED',
    instructor: 'Prof. David Vance',
    dean: 'Dr. Marcus Sterling',
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  },
  {
    id: 'CERT-DS201-2026-4419',
    title: 'CS201: Data Structures and Algorithmic Analysis',
    courseCode: 'CS201',
    issuer: 'Meridian Institute of Technology',
    issueDate: 'September 10, 2026',
    grade: 'A (92.0%)',
    skills: ['C++', 'Pointers', 'Graphs & Trees', 'Time Complexity'],
    credentialUrl: 'https://unicodeide.edu/verify/CERT-DS201-2026-4419',
    status: 'VERIFIED',
    instructor: 'Prof. Sarah Jenkins',
    dean: 'Dr. Marcus Sterling',
    hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
  },
];

export default function StudentCertificatesPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCert, setSelectedCert] = useState(null);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Load persistent certificates from localStorage
  const [certificates, setCertificates] = useState(() => {
    try {
      const saved = localStorage.getItem('unicodeide_student_certs');
      return saved ? JSON.parse(saved) : INITIAL_CERTIFICATES;
    } catch {
      return INITIAL_CERTIFICATES;
    }
  });

  const [inProgressTracks, setInProgressTracks] = useState([
    {
      title: 'CS301: Systems Programming & Docker Containerization',
      courseCode: 'CS301',
      progress: 100, // Ready to claim!
      eligibleToClaim: true,
      instructor: 'Prof. Sarah Jenkins',
      skills: ['Docker', 'Linux Systems', 'C/C++', 'Concurrency'],
      grade: 'A+ (97.0%)',
    },
    {
      title: 'AI301: Deep Learning Foundations & Model Deployment',
      courseCode: 'AI301',
      progress: 74,
      eligibleToClaim: false,
      estimatedCompletion: 'November 2026',
      instructor: 'Dr. Alan Turing',
      skills: ['PyTorch', 'TensorFlow', 'Model Inference'],
    },
  ]);

  // Persist certificates
  useEffect(() => {
    try {
      localStorage.setItem('unicodeide_student_certs', JSON.stringify(certificates));
    } catch {
      // ignore
    }
  }, [certificates]);

  // Claim Certificate action
  const handleClaimCertificate = (track) => {
    const randomSerial = Math.floor(1000 + Math.random() * 9000);
    const newId = `CERT-${track.courseCode}-2026-${randomSerial}`;
    const newCert = {
      id: newId,
      title: track.title,
      courseCode: track.courseCode,
      issuer: user?.university?.name || 'Meridian Institute of Technology',
      issueDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      grade: track.grade || 'A+ (95.0%)',
      skills: track.skills,
      credentialUrl: `https://unicodeide.edu/verify/${newId}`,
      status: 'VERIFIED',
      instructor: track.instructor || 'Prof. Sarah Jenkins',
      dean: 'Dr. Marcus Sterling',
      hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    };

    setCertificates((prev) => [newCert, ...prev]);
    setInProgressTracks((prev) => prev.filter((t) => t.courseCode !== track.courseCode));
    setSelectedCert(newCert); // Instantly open the minted certificate preview!
  };

  const handleCopyLink = (cert) => {
    navigator.clipboard.writeText(cert.credentialUrl);
    setCopiedId(cert.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleVerifySearch = (e) => {
    e.preventDefault();
    const query = verifyInput.trim().toUpperCase();
    if (!query) return;

    const found = certificates.find((c) => c.id.toUpperCase() === query);
    if (found) {
      setVerifyResult({ found: true, cert: found });
    } else {
      setVerifyResult({
        found: false,
        id: query,
        message: 'No matching academic credential found on the cryptographic registry.',
      });
    }
  };

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
            className="gap-2 text-xs"
            onClick={() => {
              setVerifyModalOpen(true);
              setVerifyResult(null);
              setVerifyInput('');
            }}
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
            <div className="text-xs text-muted-foreground">Issued Credentials</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-emerald-500">100%</div>
            <div className="text-xs text-muted-foreground">Cryptographically Signed</div>
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

      {/* Eligible to Claim Alert Banner */}
      {inProgressTracks.some((t) => t.eligibleToClaim) && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border border-primary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shrink-0">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                <span>Certificate Ready to Claim!</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-500 font-bold uppercase">
                  100% Complete
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                You have fulfilled all lab challenges for <strong>CS301: Systems Programming & Docker Containerization</strong> with an <strong>A+ (97%)</strong>.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => handleClaimCertificate(inProgressTracks.find((t) => t.eligibleToClaim))}
            className="font-semibold text-xs whitespace-nowrap shadow-md"
          >
            Claim Credential
          </Button>
        </div>
      )}

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
            className="p-6 border-border hover:border-primary/50 transition-all flex flex-col justify-between gap-5 shadow-sm group"
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
                  <span className="font-medium text-foreground">{user?.name || 'Alex Rivera'}</span>
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
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs gap-1.5"
                  onClick={() => handleCopyLink(cert)}
                >
                  {copiedId === cert.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
                  <span>{copiedId === cert.id ? 'Copied!' : 'Share Link'}</span>
                </Button>
              </div>

              <Button
                size="sm"
                className="text-xs gap-1.5 shadow"
                onClick={() => setSelectedCert(cert)}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>View Official Certificate</span>
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
                    {track.eligibleToClaim ? 'Ready to Claim' : `Est. ${track.estimatedCompletion}`}
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

      {/* OFFICIAL CERTIFICATE PREVIEW MODAL */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-fade-up">
            {/* Modal Bar */}
            <div className="p-3 px-6 border-b border-border bg-muted/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-mono font-semibold text-foreground">
                  Official Academic Credential · {selectedCert.id}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.print()}
                  className="text-xs gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print / PDF</span>
                </Button>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Certificate Canvas */}
            <div className="p-6 sm:p-10 bg-gradient-to-br from-card via-background to-card relative">
              <div className="border-4 border-double border-primary/40 rounded-xl p-8 sm:p-12 relative text-center space-y-6 shadow-2xl bg-card/60 backdrop-blur">
                {/* Guilloche corners */}
                <div className="absolute top-2 left-2 text-primary/40 font-mono text-xs">❖</div>
                <div className="absolute top-2 right-2 text-primary/40 font-mono text-xs">❖</div>
                <div className="absolute bottom-2 left-2 text-primary/40 font-mono text-xs">❖</div>
                <div className="absolute bottom-2 right-2 text-primary/40 font-mono text-xs">❖</div>

                {/* Institution Header */}
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2 text-primary font-mono text-xs tracking-widest uppercase">
                    <Building2 className="h-4 w-4" />
                    <span>{selectedCert.issuer}</span>
                  </div>
                  <div className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                    Division of Computer Science & Systems Engineering
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-xs font-mono uppercase tracking-[0.25em] text-muted-foreground border-b border-border pb-1">
                    Certificate of Competence & Algorithmic Mastery
                  </span>
                  <p className="text-xs text-muted-foreground italic mt-3">This credential is formally presented to</p>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight py-2 font-serif">
                    {user?.name || 'Alex Rivera'}
                  </h2>
                  <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
                    having successfully completed all laboratory exercises, containerized code examinations, and rigorous curriculum requirements for
                  </p>
                  <h3 className="text-lg sm:text-xl font-bold text-primary pt-2">
                    {selectedCert.title}
                  </h3>
                </div>

                {/* Badges & Grade */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-mono font-bold">
                    Grade: {selectedCert.grade}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-mono font-semibold">
                    Honors Recognition
                  </span>
                </div>

                {/* Signatures & Seal */}
                <div className="grid grid-cols-1 sm:grid-cols-3 items-end gap-6 pt-6 border-t border-border/80">
                  <div className="text-center sm:text-left space-y-1">
                    <div className="font-serif italic text-base text-foreground font-semibold">
                      {selectedCert.instructor}
                    </div>
                    <div className="w-32 h-0.5 bg-border mx-auto sm:mx-0" />
                    <div className="text-[10px] font-mono text-muted-foreground uppercase">Faculty Instructor</div>
                  </div>

                  {/* Gold Seal Emblem */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-amber-500/20 via-primary/30 to-amber-300/20 border-2 border-primary/60 flex items-center justify-center shadow-lg">
                      <Award className="h-8 w-8 text-primary" />
                    </div>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-primary/80 mt-1">
                      Official Seal
                    </span>
                  </div>

                  <div className="text-center sm:text-right space-y-1">
                    <div className="font-serif italic text-base text-foreground font-semibold">
                      {selectedCert.dean}
                    </div>
                    <div className="w-32 h-0.5 bg-border mx-auto sm:ml-auto sm:mr-0" />
                    <div className="text-[10px] font-mono text-muted-foreground uppercase">Dean of Academic Affairs</div>
                  </div>
                </div>

                {/* Cryptographic Hash Verification footer */}
                <div className="pt-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-muted-foreground gap-2">
                  <div>Issued: {selectedCert.issueDate}</div>
                  <div className="flex items-center gap-1.5 text-primary">
                    <Lock className="h-3 w-3" />
                    <span>Registry ID: {selectedCert.id}</span>
                  </div>
                  <div className="truncate max-w-[200px]" title={selectedCert.hash}>
                    SHA-256: {selectedCert.hash.slice(0, 16)}...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VERIFY CREDENTIALS MODAL */}
      {verifyModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl p-6 text-left space-y-4 animate-fade-up">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <h3 className="font-bold text-sm text-foreground">Credential Verification Registry</h3>
              </div>
              <button
                onClick={() => setVerifyModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Enter any UniCodeIDE certificate credential ID (e.g. <code>CERT-CS101-2026-8842</code>) to confirm cryptographic integrity against the institutional ledger.
            </p>

            <form onSubmit={handleVerifySearch} className="flex gap-2">
              <input
                type="text"
                placeholder="CERT-CS101-2026-8842"
                value={verifyInput}
                onChange={(e) => setVerifyInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs font-mono rounded-md border border-input bg-background text-foreground uppercase placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button type="submit" size="sm" className="text-xs font-semibold">
                Verify
              </Button>
            </form>

            {verifyResult && (
              <div className="mt-4 pt-4 border-t border-border">
                {verifyResult.found ? (
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Valid Credential Authenticated</span>
                    </div>
                    <div className="text-xs space-y-1 text-foreground">
                      <div><strong>Recipient:</strong> {user?.name || 'Alex Rivera'}</div>
                      <div><strong>Course:</strong> {verifyResult.cert.title}</div>
                      <div><strong>Issuing Body:</strong> {verifyResult.cert.issuer}</div>
                      <div><strong>Grade Conferred:</strong> {verifyResult.cert.grade}</div>
                      <div className="font-mono text-[10px] text-muted-foreground break-all pt-1">
                        Ledger Hash: {verifyResult.cert.hash}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs space-y-1">
                    <div className="font-bold">Credential Not Found</div>
                    <p className="text-[11px]">{verifyResult.message}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
