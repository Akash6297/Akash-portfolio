'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { adminFetch } from './api';
import { Button, inputClass, Notice } from './ui';

export function LoginForm() {
  const params = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await adminFetch('/api/admin/login', { method: 'POST', body: { username, password } });
    if (!res.ok) {
      setLoading(false);
      setError(res.data.message ?? 'Sign-in failed.');
      return;
    }
    const next = params.get('next');
    // Only allow redirects inside the admin area.
    window.location.href = next && next.startsWith('/admin') && !next.startsWith('//') ? next : '/admin';
  };

  return (
    <form onSubmit={submit} className="mt-8 space-y-4">
      {error && <Notice tone="error">{error}</Notice>}
      <div>
        <label htmlFor="admin-username" className="mb-1.5 block text-sm text-muted">Username or email</label>
        <input id="admin-username" autoComplete="username" required value={username} onChange={(e) => setUsername(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label htmlFor="admin-password" className="mb-1.5 block text-sm text-muted">Password</label>
        <input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
      </div>
      <Button type="submit" variant="primary" loading={loading} className="w-full">
        Sign in
      </Button>
      <p className="text-xs text-subtle">Use the same admin account as the previous site.</p>
    </form>
  );
}
