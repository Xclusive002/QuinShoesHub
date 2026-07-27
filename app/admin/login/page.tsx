'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { setSessionInStorage } from '@/lib/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      setSessionInStorage({ isAuthenticated: true, username });
      router.push('/admin/dashboard');
    } catch {
      setError('Invalid username or password. Try admin / quinn123');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex justify-center mb-12 hover:opacity-70 transition-opacity">
          <img src="/images/logo.png" alt="Quinn Shoes Hub" className="h-12 w-auto" />
        </Link>

        {/* Login Card */}
        <div className="border border-border p-8">
          <h1 className="text-3xl font-display font-bold mb-2 text-center">Admin Access</h1>
          <p className="text-center text-muted-foreground text-sm mb-8">Manage your Quinn Shoes Hub store</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-4 py-3 border border-border bg-secondary text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:border-foreground transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-border bg-secondary text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:border-foreground transition-colors"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-foreground text-background py-3 font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-secondary border border-border text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">Scaffolded admin auth</p>
            <p>This login currently uses a session cookie scaffold and will be replaced by Supabase Auth once the project environment is configured.</p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <Link href="/" className="text-sm text-muted-foreground hover:underline">
            Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}
