import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '../lib/trpc';

export default function Login() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      toast.success('Welcome back!');
      if (data.church?.approvalStatus === 'approved') {
        navigate('/dashboard');
      } else if (data.church?.approvalStatus === 'pending') {
        navigate('/pending');
      } else {
        navigate('/register');
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-navy rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-gold" />
            </div>
            <span className="font-semibold text-navy text-lg">Seeking Higher Church</span>
          </Link>
          <h1 className="text-2xl font-bold text-navy">Sign in to your account</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Don&apos;t have a church yet?{' '}
            <Link href="/register" className="text-navy underline">
              Register here
            </Link>
          </p>
        </div>

        <div className="bg-white rounded-xl border border-border shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-input rounded-md px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-navy text-white font-semibold py-2.5 rounded-md hover:bg-navy/90 transition-colors disabled:opacity-60"
            >
              {loginMutation.isPending ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
