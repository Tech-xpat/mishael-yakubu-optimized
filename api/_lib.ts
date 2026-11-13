// Shared helpers for the serverless endpoints. Runs on Vercel only (never shipped to the browser).
import { createHmac, timingSafeEqual } from 'node:crypto';

export const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://mmnsovgpmojjeqajbcfo.supabase.co';
export const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
export const RESEND_KEY = process.env.RESEND_API_KEY || '';
export const FROM = process.env.RESEND_FROM || 'Empire Digital Worldwide <onboarding@resend.dev>';
export const SITE = (process.env.SITE_URL || 'https://www.mishael.space').replace(/\/$/, '');

export type Req = { method?: string; headers: Record<string, string | string[] | undefined>; body?: any; query?: Record<string, any> };
export type Res = { status: (n: number) => Res; json: (b: unknown) => void; setHeader: (k: string, v: string) => void; send: (b: string) => void };

export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
export const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) && e.length <= 254;

export const db = (path: string, init: RequestInit = {}) =>
  fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });

// Any signed-in Supabase user is an admin (same rule the dashboard already uses).
export async function requireAdmin(req: Req): Promise<boolean> {
  const h = req.headers.authorization;
  const token = (Array.isArray(h) ? h[0] : h || '').replace(/^Bearer\s+/i, '');
  if (!token || !SERVICE_KEY) return false;
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${token}` } });
  return r.ok;
}

export const unsubToken = (email: string) => createHmac('sha256', SERVICE_KEY).update(email.toLowerCase()).digest('hex').slice(0, 32);
export const checkToken = (email: string, token: string) => {
  const a = Buffer.from(unsubToken(email));
  const b = Buffer.from(token || '');
  return a.length === b.length && timingSafeEqual(a, b);
};
export const unsubLink = (email: string) => `${SITE}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${unsubToken(email)}`;

export async function sendMail(to: string, subject: string, html: string) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  return r.ok;
}

const shell = (title: string, body: string, unsub?: string) => `<!DOCTYPE html><html><body style="margin:0;background:#f4f4f5;font-family:Arial,sans-serif;color:#222;line-height:1.6">
<div style="max-width:600px;margin:0 auto;padding:24px">
<div style="background:#0a0a0a;color:#fff;padding:28px;text-align:center;border-radius:8px"><h1 style="margin:0;font-size:22px">${title}</h1></div>
<div style="background:#fff;padding:28px;border-radius:8px;margin:16px 0">${body}</div>
<p style="text-align:center;color:#999;font-size:12px">&copy; ${new Date().getFullYear()} Empire Digital Worldwide${unsub ? ` &middot; <a href="${unsub}" style="color:#999">Unsubscribe</a>` : ''}</p>
</div></body></html>`;
const btn = (href: string, label: string) => `<p><a href="${href}" style="background:#0a0a0a;color:#fff;padding:12px 28px;text-decoration:none;border-radius:5px;display:inline-block">${label}</a></p>`;

export const templates = {
  welcome: (name: string, unsub: string) =>
    shell('Welcome to Empire Digital Worldwide', `<p>Hi ${esc(name)},</p><p>Thanks for subscribing. You will hear from us about new projects, services and updates.</p><p>We build websites, brands and AI automation.</p>${btn(`${SITE}/portfolio`, 'View our portfolio')}`, unsub),
  announcement: (project: string, category: string, unsub: string) =>
    shell('New project launched', `<h2 style="margin-top:0">${esc(category)}: ${esc(project)}</h2><p>We just added a new piece of work to the portfolio.</p>${btn(`${SITE}/portfolio`, 'See it now')}`, unsub),
  newsletter: (subject: string, content: string, unsub: string) => shell(esc(subject), content, unsub),
};
