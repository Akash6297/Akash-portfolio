import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@/components/admin/LoginForm';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <main id="main" className="grid min-h-screen place-items-center px-4 py-16">
      <div className="w-full max-w-sm">
        <p className="text-[15px] font-semibold tracking-[0.12em] text-fg">
          AKASH<span className="text-accent">.</span> <span className="label-mono ml-2">Admin</span>
        </p>
        <h1 className="font-display mt-8 text-5xl text-fg">Sign in</h1>
        <p className="mt-2 text-sm text-muted">Manage content, messages, bookings and your resume.</p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
