import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Logo } from '../../components/common/Logo';
import { authService } from '../../services/authService';
import { Mail, CheckCircle2, ArrowLeft, AlertCircle, RefreshCw, KeyRound } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [tokenPreview, setTokenPreview] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please provide your registered university email');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.forgotPassword(email);
      setSubmitted(true);
      if (response?.data?.resetTokenPreview) {
        setTokenPreview(response.data.resetTokenPreview);
      }
    } catch (err) {
      setError(err.message || 'Unable to process reset request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-background relative isolate">
      {/* Background Grid */}
      <div className="absolute inset-0 -z-10 grid-pattern opacity-20 [mask-image:radial-gradient(ellipse_at_center,white_20%,transparent_80%)]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <Logo size="lg" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Reset your password
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your university email to receive recovery instructions
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="py-8 px-6 sm:px-10 border border-border bg-card/90 shadow-xl">
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                  Registered University Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@meridian.edu"
                    className="w-full h-10 px-3 pl-9 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
                  />
                  <Mail className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 font-semibold"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Sending Reset Instructions...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>
          ) : (
            <div className="py-2 space-y-4 animate-fade-up text-left">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <div>
                  <div className="font-semibold text-xs">Reset Instructions Dispatched</div>
                  <div className="text-[11px] text-emerald-500/80">
                    Email sent to <span className="font-semibold text-foreground">{email}</span> (expires in 1 hour).
                  </div>
                </div>
              </div>

              {/* Simulated Outgoing University Email Preview */}
              <div className="rounded-xl border border-border bg-muted/40 overflow-hidden shadow-inner">
                <div className="p-3 border-b border-border bg-muted/70 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono font-semibold text-foreground">University Mail Gateway</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">SMTP 250 OK</span>
                </div>

                <div className="p-4 space-y-3 bg-card/60 text-xs">
                  <div className="space-y-1 pb-2 border-b border-border/60 text-[11px]">
                    <div className="text-muted-foreground">
                      <span className="font-mono text-[10px] uppercase text-muted-foreground/80 w-14 inline-block">From:</span>
                      <span className="text-foreground">security@meridian.edu (UniCodeIDE Security)</span>
                    </div>
                    <div className="text-muted-foreground">
                      <span className="font-mono text-[10px] uppercase text-muted-foreground/80 w-14 inline-block">To:</span>
                      <span className="text-foreground">{email}</span>
                    </div>
                    <div className="text-muted-foreground">
                      <span className="font-mono text-[10px] uppercase text-muted-foreground/80 w-14 inline-block">Subject:</span>
                      <span className="font-semibold text-foreground">Action Required: Reset your UniCodeIDE password</span>
                    </div>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">
                    Hello, we received an authorization request to reset the password associated with this university profile. Click the secure link below to proceed:
                  </p>

                  <div className="py-2 text-center">
                    <Link
                      to={`/reset-password?token=${tokenPreview}&email=${encodeURIComponent(email)}`}
                      className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs shadow-md hover:bg-primary/90 transition-all cursor-pointer"
                    >
                      <KeyRound className="h-4 w-4 mr-2" />
                      Open Password Reset Screen
                    </Link>
                  </div>

                  <div className="text-[10px] font-mono text-muted-foreground/70 bg-muted/60 p-2 rounded border border-border/60 break-all select-all">
                    Reset Token: {tokenPreview || 'Simulated-Token-64-Bytes'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const resetUrl = `${window.location.origin}/reset-password?token=${tokenPreview}&email=${encodeURIComponent(email)}`;
                    navigator.clipboard.writeText(resetUrl);
                    alert('Password reset link copied to clipboard!');
                  }}
                  className="flex-1 text-xs"
                >
                  Copy Reset Link
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setSubmitted(false)}
                  className="text-xs text-muted-foreground"
                >
                  Try another email
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-border text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
