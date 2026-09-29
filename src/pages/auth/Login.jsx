import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Logo } from '../../components/common/Logo';
import { authService } from '../../services/authService';
import { Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, RefreshCw, KeyRound } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [formError, setFormError] = useState('');

  const { login, loading, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const demoAccounts = authService.getDemoAccounts();
  const returnPath = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email.trim()) {
      setFormError('Please enter your university email or username');
      return;
    }
    if (!password) {
      setFormError('Please enter your account password');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      navigate(returnPath || result.redirectPath, { replace: true });
    }
  };

  const handleQuickDemoLogin = async (demoAccount) => {
    setEmail(demoAccount.email);
    setPassword(demoAccount.defaultPassword);
    setFormError('');

    const result = await login(demoAccount.email, demoAccount.defaultPassword);
    if (result.success) {
      navigate(result.redirectPath, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-background relative isolate">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 -z-10 grid-pattern opacity-20 [mask-image:radial-gradient(ellipse_at_center,white_20%,transparent_80%)]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <Logo size="lg" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Sign in to your portal
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Access your courses, cloud IDE, and examinations
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="py-8 px-6 sm:px-10 border border-border bg-card/90 shadow-xl">
          {(formError || authError) && (
            <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{formError || authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                University Email / Username
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@meridian.edu"
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-10 px-3 pr-10 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-xs text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5"
                />
                <span>Remember this session</span>
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 font-semibold"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </form>

          {/* Quick Demo Switcher Section */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center">
                <KeyRound className="h-3 w-3 mr-1 text-primary" /> Fast Demo Access
              </span>
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border">
                Dev Testing
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => handleQuickDemoLogin(account)}
                  disabled={loading}
                  className="p-2 rounded border border-border/80 bg-muted/30 hover:bg-muted/70 text-left text-xs transition-colors flex flex-col cursor-pointer"
                >
                  <span className="font-semibold text-foreground truncate">{account.name.split(' ')[0]}</span>
                  <span className="text-[10px] text-muted-foreground capitalize font-mono">
                    {account.role.replace('_', ' ').toLowerCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            New student?{' '}
            <Link to="/register" className="text-primary hover:underline font-semibold">
              Create student account
            </Link>
          </div>
        </Card>

        {/* Security assurance footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Multi-tenant isolated authentication
        </p>
      </div>
    </div>
  );
}
