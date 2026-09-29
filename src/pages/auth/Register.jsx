import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Logo } from '../../components/common/Logo';
import { Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, RefreshCw, GraduationCap, Building2 } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    universityCode: 'MERIDIAN',
    department: 'Computer Science',
    password: '',
    confirmPassword: '',
    acceptTerms: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const { register, loading, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Please enter your full legal name');
      return;
    }

    if (!formData.email.trim()) {
      setFormError('Please provide your university student email');
      return;
    }

    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (!formData.acceptTerms) {
      setFormError('You must accept the academic honesty and platform terms to proceed');
      return;
    }

    const result = await register({
      name: formData.name,
      email: formData.email,
      universityCode: formData.universityCode,
      department: formData.department,
      password: formData.password,
    });

    if (result.success) {
      navigate(result.redirectPath, { replace: true });
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
          Student Registration
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Create your learner account to access your courses and workspace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="py-8 px-6 sm:px-10 border border-border bg-card/90 shadow-xl">
          {/* Institutional Provisioning Notice */}
          <div className="mb-6 p-3 rounded-lg border border-border bg-muted/40 text-xs text-muted-foreground flex items-start space-x-2.5">
            <Building2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-foreground">Faculty & Administration:</span> Accounts for instructors and university administrators are provisioned directly by your campus IT department or Super Admin.
            </div>
          </div>

          {(formError || authError) && (
            <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{formError || authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Alex Rivera"
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                Student Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="arivera@meridian.edu"
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="universityCode" className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  University Code
                </label>
                <input
                  id="universityCode"
                  name="universityCode"
                  type="text"
                  required
                  value={formData.universityCode}
                  onChange={handleChange}
                  placeholder="MERIDIAN"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm font-mono uppercase focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div>
                <label htmlFor="department" className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  Department
                </label>
                <input
                  id="department"
                  name="department"
                  type="text"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Computer Science"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                Create Password (min. 8 characters)
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className="w-full h-10 px-3 pr-10 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all font-mono"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••••••"
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all font-mono"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-start space-x-2 text-xs text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5 mt-0.5"
                />
                <span>I agree to UniCodeIDE's Academic Honesty Policy and Terms of Service.</span>
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 font-semibold mt-4"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Creating Student Account...
                </>
              ) : (
                <>
                  Register Student Account <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-semibold">
              Sign in here
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
