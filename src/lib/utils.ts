/** Joins class names, skipping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2025-04" → "Apr 2025"; "present" → "Present". */
export function formatMonth(value: string) {
  if (value === 'present') return 'Present';
  const [year, month] = value.split('-').map(Number);
  return month ? `${MONTHS[month - 1]} ${year}` : String(year);
}

/** Whole-month duration between two "YYYY-MM" values, inclusive. */
export function formatDuration(start: string, end: string, now = new Date()) {
  const [sy, sm] = start.split('-').map(Number);
  const [ey, em] = end === 'present' ? [now.getFullYear(), now.getMonth() + 1] : end.split('-').map(Number);
  const months = (ey - sy) * 12 + (em - sm) + 1;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [];
  if (years) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
  if (rest) parts.push(`${rest} mo${rest > 1 ? 's' : ''}`);
  return parts.join(' ') || '1 mo';
}

/** "3 days ago" style relative time. */
export function timeAgo(iso: string, now = Date.now()) {
  const seconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  const units: Array<[number, Intl.RelativeTimeFormatUnit]> = [
    [60, 'second'], [60, 'minute'], [24, 'hour'], [30, 'day'], [12, 'month'], [Infinity, 'year'],
  ];
  let value = seconds;
  for (const [size, unit] of units) {
    if (value < size) return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-Math.round(value), unit);
    value /= size;
  }
  return '';
}

export function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
