'use client';

export interface ApiResult<T = Record<string, unknown>> {
  ok: boolean;
  status: number;
  data: T & { message?: string; fields?: Record<string, string>; needsOtp?: boolean };
}

/** JSON fetch for admin APIs. Redirects to the login page when the session has expired. */
export async function adminFetch<T = Record<string, unknown>>(url: string, options: { method?: string; body?: unknown } = {}): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method: options.method ?? 'GET',
      headers: options.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: 'no-store',
    });
    if (res.status === 401 && !url.endsWith('/login')) {
      window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`;
    }
    const data = (await res.json().catch(() => ({}))) as ApiResult<T>['data'];
    return { ok: res.ok && (data as { ok?: boolean }).ok !== false, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: { message: 'Network error — check your connection.' } as ApiResult<T>['data'] };
  }
}

/** Uploads an image file via /api/admin/upload. */
export async function uploadImage(file: File) {
  const body = new FormData();
  body.append('file', file);
  try {
    const res = await fetch('/api/admin/upload', { method: 'POST', body });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false as const, message: data.message ?? 'Upload failed.' };
    return { ok: true as const, url: data.url as string, width: data.width as number, height: data.height as number };
  } catch {
    return { ok: false as const, message: 'Network error during upload.' };
  }
}
