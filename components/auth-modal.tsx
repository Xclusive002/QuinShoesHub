'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Mail, ShieldCheck, Sparkles, X } from 'lucide-react';
import { Toast } from '@/components/toast';
import { saveMemberProfile } from '@/lib/member-account';
import { supabase } from '@/lib/supabase';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  mode?: 'signin' | 'signup';
  onSuccess?: (user: { email: string }) => void;
}

export function AuthModal({ open, onClose, mode = 'signup', onSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(mode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    setIsSignUp(mode === 'signup');
    setError(null);
    setMessage(null);
  }, [mode, open]);

  if (!open) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || password.length < 6) {
      setError('Please enter a valid email and a password with at least 6 characters.');
      setIsSubmitting(false);
      return;
    }

    try {
      if (isSignUp) {
        try {
          const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: normalizedEmail, password, fullName: fullName.trim(), phone: phone.trim() }),
          });

          const payload = await res.json();

          if (!res.ok) {
            setError(payload?.error || 'Signup failed');
            setToast({ message: payload?.error || 'Signup failed', type: 'error' });
            return;
          }

          let authUserId: string | undefined;
          if (payload?.user?.authUserId) {
            authUserId = payload.user.authUserId;
          }

          let savedProfile = {
            email: normalizedEmail,
            fullName: fullName.trim(),
            phone: phone.trim(),
            joinedAt: new Date().toISOString(),
            mode: 'local' as const,
            authUserId,
            isAuthenticated: true,
          };

          if (supabase) {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: normalizedEmail,
              password,
            });

            if (!signInError && signInData?.user) {
              savedProfile = {
                email: normalizedEmail,
                fullName: fullName.trim(),
                phone: phone.trim(),
                joinedAt: new Date().toISOString(),
                mode: 'supabase' as const,
                authUserId: signInData.user.id,
                isAuthenticated: true,
              };
            }
          }

          saveMemberProfile(savedProfile);
          setMessage('Welcome aboard. Your account is ready.');
          setToast({ message: 'Account created', type: 'success' });
          onSuccess?.({ email: normalizedEmail });
          onClose();
        } catch (err) {
          const profile = {
            email: normalizedEmail,
            fullName: fullName.trim(),
            phone: phone.trim(),
            joinedAt: new Date().toISOString(),
            mode: 'local' as const,
            isAuthenticated: true,
          };
          saveMemberProfile(profile);
          setMessage('Welcome aboard. Your account is ready locally for this browser.');
          setToast({ message: 'Signed up locally (no DB)', type: 'info' });
          onSuccess?.({ email: normalizedEmail });
          onClose();
        }
      } else {
        let profile = {
          email: normalizedEmail,
          fullName: '',
          phone: '',
          joinedAt: new Date().toISOString(),
          mode: 'local' as const,
          isAuthenticated: true,
        };

        if (supabase) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          });

          if (!signInError && signInData?.user) {
            profile = {
              email: normalizedEmail,
              fullName: (signInData.user.user_metadata?.full_name as string) || '',
              phone: (signInData.user.user_metadata?.phone as string) || '',
              joinedAt: new Date().toISOString(),
              mode: 'supabase' as const,
              authUserId: signInData.user.id,
              isAuthenticated: true,
            };
          } else {
            setError(signInError?.message || 'Sign in failed');
            setToast({ message: signInError?.message || 'Sign in failed', type: 'error' });
            return;
          }
        }

        saveMemberProfile(profile);
        setMessage('Welcome back. Your session is ready.');
        setToast({ message: 'Signed in', type: 'success' });
        onSuccess?.({ email: normalizedEmail });
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 border border-border bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              Quinn members
            </div>
            <h2 className="text-2xl font-display font-bold">{isSignUp ? 'Create your account' : 'Welcome back'}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {isSignUp
                ? 'Join to save your cart, wishlist, and checkout details in one place.'
                : 'Sign in to continue where you left off.'}
            </p>
          </div>
          <button onClick={onClose} className="rounded-full border border-border p-2 transition hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="rounded-2xl border border-border bg-secondary/70 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ShieldCheck className="h-4 w-4" />
              Premium checkout is ready for members.
            </div>
          </div>

          <label className="block text-sm font-medium">
            <span className="mb-2 block">Email address</span>
            <div className="flex items-center gap-2 border border-border bg-background px-3 py-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent outline-none"
              />
            </div>
          </label>

          {isSignUp ? (
            <>
              <label className="block text-sm font-medium">
                <span className="mb-2 block">Full name</span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full border border-border bg-background px-3 py-3 outline-none"
                />
              </label>

              <label className="block text-sm font-medium">
                <span className="mb-2 block">Phone number</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 812 345 6789"
                  className="w-full border border-border bg-background px-3 py-3 outline-none"
                />
              </label>
            </>
          ) : null}

          <label className="block text-sm font-medium">
            <span className="mb-2 block">Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              className="w-full border border-border bg-background px-3 py-3 outline-none"
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {message ? <p className="text-sm text-green-700">{message}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-foreground px-4 py-3 text-sm font-semibold text-background transition hover:opacity-80 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            ) : null}
            {isSubmitting ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <Toast message={toast?.message ?? message ?? null} type={toast?.type ?? (error ? 'error' : 'info')} />

        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <button
            onClick={() => setIsSignUp((current) => !current)}
            className="font-medium text-foreground transition hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Need an account? Sign up"}
          </button>
          <button onClick={onClose} className="transition hover:underline">
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
