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
            <div className="text-center py-4 space-y-4 animate-fade-up">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Check your inbox</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If an account matches <span className="font-semibold text-foreground">{email}</span>, we have sent a secure password reset link valid for 1 hour.
              </p>

              {tokenPreview && (
                <div className="mt-4 p-3 rounded border border-border bg-muted/30 text-left">
                  <div className="text-[10px] font-mono text-muted-foreground flex items-center mb-1">
                    <KeyRound className="h-3 w-3 mr-1 text-primary" /> Demo Token Preview:
                  </div>
                  <div className="font-mono text-xs text-foreground break-all select-all">
                    {tokenPreview}
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => setSubmitted(false)}
                className="w-full text-xs"
              >
                Try another email
              </Button>
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
