// Email templates: the stored format matches the previous site's `emailtemplates`
// collection (htmlContent = JSON config), so existing customisations carry over.
// Pure functions only — used by the server and by the admin preview.

export interface TemplateConfig {
  primaryColor: string;
  headerText: string;
  bodyText: string;
  footerText: string;
  showSocials: boolean;
  githubLink?: string;
  linkedinLink?: string;
  /** Only meaningful for automatic emails (e.g. the visitor confirmation). */
  enabled?: boolean;
}

export interface TemplateDefinition {
  name: string;
  label: string;
  description: string;
  variables: string[];
  subject: string;
  config: TemplateConfig;
  /** Can be switched off in the admin panel. */
  optional?: boolean;
}

const base = {
  primaryColor: '#4F7DFF',
  footerText: 'Akash Mandal · Full-Stack Developer · Purulia, West Bengal, India',
  showSocials: true,
  githubLink: 'https://github.com/Akash6297',
  linkedinLink: 'https://www.linkedin.com/in/akash-mandal07/',
};

export const TEMPLATE_DEFINITIONS: TemplateDefinition[] = [
  {
    name: 'adminNotification',
    label: 'New message (to you)',
    description: 'Sent to your inbox when someone submits the contact form.',
    variables: ['name', 'email', 'subject', 'message'],
    subject: '[Portfolio] {{subject}} — from {{name}}',
    config: { ...base, showSocials: false, headerText: 'New portfolio message', bodyText: 'From: {{name}} ({{email}})\nSubject: {{subject}}\n\n{{message}}\n\nReply to this email to answer them directly.' },
  },
  {
    name: 'userConfirmation',
    label: 'Message received (to visitor)',
    description: 'Automatic confirmation sent to the person who contacted you.',
    variables: ['name', 'subject', 'message'],
    subject: 'Thanks for reaching out, {{name}}',
    optional: true,
    config: { ...base, enabled: true, headerText: 'Message received', bodyText: "Hi {{name}},\n\nThanks for getting in touch — your message has reached me and I'll reply soon.\n\nYour message:\n{{message}}\n\nAkash Mandal" },
  },
  {
    name: 'adminReply',
    label: 'Reply (to visitor)',
    description: 'Wraps the replies you send from the admin inbox.',
    variables: ['name', 'subject', 'replyMessage', 'originalMessage'],
    subject: 'Re: {{subject}}',
    config: { ...base, headerText: 'A reply from Akash Mandal', bodyText: 'Hi {{name}},\n\n{{replyMessage}}\n\nAkash Mandal\n\n— Your original message —\n{{originalMessage}}' },
  },
  {
    name: 'bookingRequest',
    label: 'New booking (to you)',
    description: 'Sent to your inbox when someone requests a discovery call.',
    variables: ['name', 'email', 'date', 'time', 'message'],
    subject: '[Portfolio] Call request: {{date}} at {{time}} — {{name}}',
    config: { ...base, showSocials: false, headerText: 'New discovery-call request', bodyText: '{{name}} ({{email}}) requested a call on {{date}} at {{time}} IST.\n\nTopic:\n{{message}}\n\nConfirm or decline it in the admin panel.' },
  },
  {
    name: 'bookingConfirmed',
    label: 'Booking confirmed (to visitor)',
    description: 'Sent when you confirm a call.',
    variables: ['name', 'date', 'time', 'meetingLink'],
    subject: 'Confirmed: our call on {{date}} at {{time}} IST',
    config: { ...base, headerText: 'Your call is confirmed', bodyText: 'Hi {{name}},\n\nOur call on {{date}} at {{time}} (IST) is confirmed.\n\nMeeting link: {{meetingLink}}\n\nLooking forward to speaking with you.\n\nAkash Mandal' },
  },
  {
    name: 'bookingRejected',
    label: 'Booking declined (to visitor)',
    description: 'Sent when you decline a call request.',
    variables: ['name', 'date', 'time'],
    subject: 'About your call request on {{date}}',
    config: { ...base, headerText: 'About your call request', bodyText: "Hi {{name}},\n\nUnfortunately I can't make {{date}} at {{time}} (IST). Please pick another time on my portfolio, or reply to this email.\n\nAkash Mandal" },
  },
];

export const templateDefinition = (name: string) => TEMPLATE_DEFINITIONS.find((t) => t.name === name);

export const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Template text is escaped, then a few formatting tags without attributes are allowed back. */
function formatTemplateText(text: string) {
  return escapeHtml(text)
    .replace(/&lt;(\/?)(b|strong|i|em|u|p|br)\s*\/?&gt;/gi, '<$1$2>')
    .replace(/\r?\n/g, '<br>');
}

/** Replaces {{variables}}. Values are escaped (and line breaks kept) unless `html` is set. */
function fill(text: string, vars: Record<string, string>, html: boolean) {
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => {
    const value = vars[key] ?? '';
    return html ? escapeHtml(value).replace(/\r?\n/g, '<br>') : value;
  });
}

export function renderSubject(subject: string, vars: Record<string, string>) {
  return fill(subject, vars, false).replace(/[\r\n]+/g, ' ').slice(0, 200);
}

export function renderText(config: TemplateConfig, vars: Record<string, string>) {
  return fill(config.bodyText, vars, false);
}

export function renderHtml(config: TemplateConfig, vars: Record<string, string>) {
  const color = /^#[0-9a-f]{3,8}$/i.test(config.primaryColor) ? config.primaryColor : '#4F7DFF';
  const safeUrl = (u?: string) => (u && /^https?:\/\//.test(u) ? escapeHtml(u) : '');
  const body = fill(formatTemplateText(config.bodyText), vars, true);
  const socials = config.showSocials
    ? [
        safeUrl(config.githubLink) && `<a href="${safeUrl(config.githubLink)}" style="color:${color};margin:0 8px;text-decoration:none">GitHub</a>`,
        safeUrl(config.linkedinLink) && `<a href="${safeUrl(config.linkedinLink)}" style="color:${color};margin:0 8px;text-decoration:none">LinkedIn</a>`,
      ].filter(Boolean).join('')
    : '';
  return `<!doctype html><html><body style="margin:0;background:#f4f4f5;padding:32px 12px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e4e4e7">
    <div style="background:${color};color:#ffffff;padding:20px 28px;font-size:18px;font-weight:600">${escapeHtml(fill(config.headerText, vars, false))}</div>
    <div style="padding:28px;font-size:15px;line-height:1.65;color:#18181b">${body}</div>
    <div style="padding:18px 28px;background:#fafafa;border-top:1px solid #e4e4e7;font-size:12px;color:#71717a;text-align:center">
      ${escapeHtml(config.footerText)}${socials ? `<div style="margin-top:8px">${socials}</div>` : ''}
    </div>
  </div></body></html>`;
}
