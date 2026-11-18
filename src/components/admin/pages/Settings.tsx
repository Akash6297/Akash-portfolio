'use client';

import { useCallback, useEffect, useState } from 'react';
import { KeyRound, ShieldCheck, Trash2, UserPlus } from 'lucide-react';
import { adminFetch } from '../api';
import { Badge, Button, Card, inputClass, Notice, PageHeader, Spinner, useToast } from '../ui';

interface Me { user: { id: string; username: string; email: string; superAdmin: boolean }; otpVerified: boolean }
interface AdminUser { id: string; username: string; email: string; superAdmin: boolean }

export function Settings() {
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState('');

  const loadMe = useCallback(async () => {
    const res = await adminFetch<Me>('/api/admin/me');
    if (res.ok) setMe(res.data);
    else setError(res.data.message ?? 'Could not load your account.');
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  return (
    <>
      <PageHeader title="Settings" description="Account security and admin users. Sensitive changes need a one-time code sent to your email." />
      {error && <Notice tone="error">{error}</Notice>}
      {!me && !error && <Spinner />}
      {me && (
        <div className="space-y-6">
          <Verification verified={me.otpVerified} email={me.user.email} onVerified={loadMe} />
          <PasswordForm verified={me.otpVerified} onChanged={loadMe} />
          {me.user.superAdmin ? <AdminUsers verified={me.otpVerified} meId={me.user.id} /> : (
            <Card className="p-5"><p className="text-sm text-muted">Only the super admin (SUPER_ADMIN_EMAIL) can manage admin accounts.</p></Card>
          )}
        </div>
      )}
    </>
  );
}

function Verification({ verified, email, onVerified }: { verified: boolean; email: string; onVerified: () => void }) {
  const toast = useToast();
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const request = async () => {
    setBusy(true);
    const res = await adminFetch('/api/admin/otp/request', { method: 'POST' });
    setBusy(false);
    toast(res.ok ? 'success' : 'error', res.data.message ?? 'Done.');
    if (res.ok) setSent(true);
  };
  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await adminFetch('/api/admin/otp/verify', { method: 'POST', body: { code } });
    setBusy(false);
    toast(res.ok ? 'success' : 'error', res.data.message ?? 'Done.');
    if (res.ok) {
      setCode('');
      setSent(false);
      onVerified();
    }
  };

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 size-5 text-muted" aria-hidden />
        <div className="flex-1">
          <h2 className="flex items-center gap-2 text-lg font-medium text-fg">Security verification {verified && <Badge tone="live">Verified</Badge>}</h2>
          <p className="mt-1 text-sm text-muted">
            {verified ? 'Sensitive settings are unlocked for 15 minutes.' : `Request a 6-digit code (sent to ${email}) to change passwords or manage admins.`}
          </p>
          {!verified && (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <Button onClick={request} loading={busy && !sent}>{sent ? 'Send a new code' : 'Send code'}</Button>
              {sent && (
                <form onSubmit={verify} className="flex gap-2">
                  <label className="sr-only" htmlFor="otp-code">Verification code</label>
                  <input id="otp-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} placeholder="123456" className={`${inputClass} w-36 font-mono tracking-[0.3em]`} />
                  <Button type="submit" variant="primary" loading={busy} disabled={code.length !== 6}>Verify</Button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function PasswordForm({ verified, onChanged }: { verified: boolean; onChanged: () => void }) {
  const toast = useToast();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await adminFetch('/api/admin/account/password', { method: 'PUT', body: { currentPassword: current, newPassword: next } });
    setBusy(false);
    toast(res.ok ? 'success' : 'error', res.data.message ?? 'Done.');
    if (res.ok) {
      setCurrent('');
      setNext('');
      onChanged();
    }
  };
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-lg font-medium text-fg"><KeyRound className="size-5 text-muted" aria-hidden /> Change password</h2>
      <form onSubmit={submit} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block text-sm text-muted">Current password
          <input type="password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} className={`${inputClass} mt-1.5`} disabled={!verified} />
        </label>
        <label className="block text-sm text-muted">New password (8+ characters)
          <input type="password" autoComplete="new-password" required minLength={8} value={next} onChange={(e) => setNext(e.target.value)} className={`${inputClass} mt-1.5`} disabled={!verified} />
        </label>
        <div className="sm:col-span-2 flex items-center justify-between gap-3">
          {!verified && <p className="text-xs text-subtle">Verify with a code first.</p>}
          <Button type="submit" variant="primary" loading={busy} disabled={!verified} className="ml-auto">Change password</Button>
        </div>
      </form>
    </Card>
  );
}

function AdminUsers({ verified, meId }: { verified: boolean; meId: string }) {
  const toast = useToast();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [editing, setEditing] = useState<(AdminUser & { newPassword: string }) | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await adminFetch<{ users: AdminUser[] }>('/api/admin/users');
    if (res.ok) setUsers(res.data.users);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await adminFetch('/api/admin/users', { method: 'POST', body: form });
    setBusy(false);
    toast(res.ok ? 'success' : 'error', res.data.message ?? 'Done.');
    if (res.ok) {
      setForm({ username: '', email: '', password: '' });
      load();
    }
  };
  const saveEdit = async () => {
    if (!editing) return;
    setBusy(true);
    const res = await adminFetch(`/api/admin/users/${editing.id}`, { method: 'PUT', body: editing });
    setBusy(false);
    toast(res.ok ? 'success' : 'error', res.data.message ?? 'Done.');
    if (res.ok) {
      setEditing(null);
      load();
    }
  };
  const remove = async (u: AdminUser) => {
    if (!window.confirm(`Delete admin "${u.username}"?`)) return;
    const res = await adminFetch(`/api/admin/users/${u.id}`, { method: 'DELETE' });
    toast(res.ok ? 'success' : 'error', res.data.message ?? 'Done.');
    if (res.ok) load();
  };

  return (
    <Card className="p-5 sm:p-6">
      <h2 className="text-lg font-medium text-fg">Admin users</h2>
      {!verified && <p className="mt-1 text-sm text-subtle">Verify with a code to add, edit or delete admins.</p>}
      {!users ? <Spinner /> : (
        <ul className="mt-4 divide-y divide-line rounded-md border border-line">
          {users.map((u) => (
            <li key={u.id} className="p-4">
              {editing?.id === u.id ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <input aria-label="Username" value={editing.username} onChange={(e) => setEditing({ ...editing, username: e.target.value })} className={inputClass} />
                  <input aria-label="Email" type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} className={inputClass} />
                  <input aria-label="New password (optional)" type="password" placeholder="New password (optional)" value={editing.newPassword} onChange={(e) => setEditing({ ...editing, newPassword: e.target.value })} className={inputClass} />
                  <div className="flex gap-2 sm:col-span-3 sm:justify-end">
                    <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                    <Button variant="primary" loading={busy} onClick={saveEdit}>Save</Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 text-fg">{u.username} {u.superAdmin && <Badge tone="accent">Super admin</Badge>} {u.id === meId && <Badge>You</Badge>}</p>
                    <p className="text-sm text-muted">{u.email}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" disabled={!verified} onClick={() => setEditing({ ...u, newPassword: '' })}>Edit</Button>
                    {!u.superAdmin && u.id !== meId && (
                      <Button size="sm" variant="ghost" disabled={!verified} onClick={() => remove(u)} aria-label={`Delete ${u.username}`}><Trash2 className="size-3.5" aria-hidden /></Button>
                    )}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={create} className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
        <label className="text-sm text-muted">Username<input required minLength={3} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className={`${inputClass} mt-1.5`} disabled={!verified} /></label>
        <label className="text-sm text-muted">Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`${inputClass} mt-1.5`} disabled={!verified} /></label>
        <label className="text-sm text-muted">Password<input type="password" required minLength={8} autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={`${inputClass} mt-1.5`} disabled={!verified} /></label>
        <Button type="submit" variant="primary" loading={busy} disabled={!verified}><UserPlus className="size-4" aria-hidden /> Add admin</Button>
      </form>
    </Card>
  );
}
