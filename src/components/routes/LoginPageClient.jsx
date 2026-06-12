"use client";

import { useContext, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Chrome, Lock, Mail, User } from 'lucide-react';
import { AppContext } from '../providers/AppContext';

const formatAuthError = (error) => {
  const code = error?.code || '';
  if (code.includes('email-already-in-use')) return 'That email already has an account. Try signing in instead.';
  if (code.includes('invalid-credential') || code.includes('wrong-password')) return 'Email or password is incorrect.';
  if (code.includes('weak-password')) return 'Use a password with at least 6 characters.';
  if (code.includes('popup-closed-by-user')) return 'Google sign-in was closed before it finished.';
  return error?.message || 'Sign-in failed. Please try again.';
};

export default function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { auth } = useContext(AppContext);
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const redirectTo = searchParams.get('next') || '/profile';

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const runAuth = async (action) => {
    setIsSubmitting(true);
    setError('');

    try {
      await action();
      router.push(redirectTo);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    runAuth(() =>
      mode === 'signin'
        ? auth.signInWithEmail({ email: form.email, password: form.password })
        : auth.registerWithEmail({ name: form.name, email: form.email, password: form.password })
    );
  };

  return (
    <div className="min-h-[calc(100vh-78px)] bg-[var(--page-bg)] px-4 py-10">
      <div className="mx-auto max-w-md rounded-[24px] border border-[var(--border-soft)] bg-white p-6 shadow-[0_16px_40px_rgba(48,67,95,0.08)] sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">InnoAI Account</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-[var(--text-strong)]">
          {mode === 'signin' ? 'Sign in' : 'Create profile'}
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
          Use Google or email/password to access your profile.
        </p>

        <button
          type="button"
          disabled={isSubmitting || auth.loading}
          onClick={() => runAuth(auth.signInWithGoogle)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-soft)] bg-white px-4 py-3 text-sm font-bold text-[var(--text-strong)] transition-colors hover:bg-[var(--panel-muted)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Chrome className="h-4 w-4" />
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--border-soft)]" />
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-faint)]">or</span>
          <div className="h-px flex-1 bg-[var(--border-soft)]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' ? (
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">Name</span>
              <span className="flex items-center gap-2 rounded-xl border border-[var(--border-soft)] bg-[var(--panel-muted)] px-3 py-3">
                <User className="h-4 w-4 text-[var(--text-faint)]" />
                <input
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-[var(--text-strong)] outline-none"
                  placeholder="Your name"
                />
              </span>
            </label>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">Email</span>
            <span className="flex items-center gap-2 rounded-xl border border-[var(--border-soft)] bg-[var(--panel-muted)] px-3 py-3">
              <Mail className="h-4 w-4 text-[var(--text-faint)]" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                className="w-full bg-transparent text-sm font-medium text-[var(--text-strong)] outline-none"
                placeholder="you@example.com"
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">Password</span>
            <span className="flex items-center gap-2 rounded-xl border border-[var(--border-soft)] bg-[var(--panel-muted)] px-3 py-3">
              <Lock className="h-4 w-4 text-[var(--text-faint)]" />
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
                className="w-full bg-transparent text-sm font-medium text-[var(--text-strong)] outline-none"
                placeholder="Minimum 6 characters"
              />
            </span>
          </label>

          {error ? (
            <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting || auth.loading}
            className="w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[var(--text-muted)]">
          {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode((current) => (current === 'signin' ? 'signup' : 'signin'));
              setError('');
            }}
            className="font-bold text-[var(--accent)] hover:text-[var(--accent-strong)]"
          >
            {mode === 'signin' ? 'Create one' : 'Sign in'}
          </button>
        </div>

        <Link href="/" className="mt-5 block text-center text-xs font-semibold text-[var(--text-faint)] hover:text-[var(--text-main)]">
          Back to home
        </Link>
      </div>
    </div>
  );
}
