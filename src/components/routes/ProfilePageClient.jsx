"use client";

import { useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LogOut, Mail, ShieldCheck, User } from 'lucide-react';
import { AppContext } from '../providers/AppContext';

export default function ProfilePageClient() {
  const { auth } = useContext(AppContext);
  const profile = auth.profile;
  const displayName = profile?.displayName || profile?.email?.split('@')[0] || 'InnoAI user';
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (auth.loading) {
    return (
      <div className="flex min-h-[calc(100vh-78px)] items-center justify-center bg-[var(--page-bg)] px-6 text-center">
        <div>
          <p className="section-kicker mb-3">Profile</p>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Loading profile...</h1>
        </div>
      </div>
    );
  }

  if (!auth.user) {
    return (
      <div className="flex min-h-[calc(100vh-78px)] items-center justify-center bg-[var(--page-bg)] px-6 text-center">
        <div className="max-w-md rounded-[24px] border border-[var(--border-soft)] bg-white p-8 shadow-sm">
          <p className="section-kicker mb-3">Profile</p>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Sign in to view your profile</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
            Your profile appears here after you sign in with Google or email.
          </p>
          <Link
            href="/login?next=/profile"
            className="mt-6 inline-flex rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white hover:bg-[var(--accent-strong)]"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-78px)] bg-[var(--page-bg)] px-4 py-10">
      <div className="shell-container">
        <section className="overflow-hidden rounded-[24px] border border-[var(--border-soft)] bg-white shadow-[0_16px_40px_rgba(48,67,95,0.08)]">
          <div className="bg-[var(--panel-muted)] px-6 py-8 sm:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Account Profile</p>
            <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-[var(--accent)] text-xl font-black text-white">
                  {profile?.photoURL ? (
                    <Image src={profile.photoURL} alt={displayName} fill sizes="80px" className="object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-[var(--text-strong)]">{displayName}</h1>
                  <p className="mt-1 text-sm font-medium text-[var(--text-muted)]">{profile?.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={auth.logout}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border-soft)] bg-white px-4 py-3 text-sm font-bold text-[var(--text-main)] hover:text-[var(--text-strong)]"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
            <ProfileField icon={User} label="User ID" value={profile?.uid} />
            <ProfileField icon={Mail} label="Email" value={profile?.email || 'No email'} />
            <ProfileField icon={ShieldCheck} label="Provider" value={profile?.providerId || 'password'} />
          </div>
        </section>
      </div>
    </div>
  );
}

function ProfileField({ icon, label, value }) {
  const FieldIcon = icon;

  return (
    <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-faint)]">
        <FieldIcon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-3 break-words text-sm font-semibold leading-6 text-[var(--text-strong)]">{value}</p>
    </div>
  );
}
