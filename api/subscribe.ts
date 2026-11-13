import { type Req, type Res, db, validEmail, sendMail, templates, unsubLink, SERVICE_KEY, RESEND_KEY } from './_lib.js';

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });
  if (!SERVICE_KEY) return res.status(500).json({ success: false, message: 'Subscriptions are not configured yet' });

  const email = String(req.body?.email || '').trim().toLowerCase();
  const name = String(req.body?.name || '').trim().slice(0, 80);
  if (!validEmail(email)) return res.status(400).json({ success: false, message: 'Please enter a valid email address' });

  const found = await db(`subscribers?select=id,status&email=eq.${encodeURIComponent(email)}`);
  const rows = found.ok ? ((await found.json()) as { id: string; status: string }[]) : [];
  if (rows.length) {
    if (rows[0].status === 'active') return res.status(200).json({ success: false, message: 'This email is already subscribed' });
    await db(`subscribers?id=eq.${rows[0].id}`, { method: 'PATCH', body: JSON.stringify({ status: 'active' }) });
    return res.status(200).json({ success: true, message: 'Welcome back! You are subscribed again.' });
  }

  const ins = await db('subscribers', { method: 'POST', body: JSON.stringify({ email, name: name || null }) });
  if (!ins.ok) return res.status(500).json({ success: false, message: 'Could not subscribe right now. Please try again.' });

  if (RESEND_KEY) {
    const ok = await sendMail(email, 'Welcome to Empire Digital Worldwide', templates.welcome(name || 'there', unsubLink(email)));
    if (ok) await db(`subscribers?email=eq.${encodeURIComponent(email)}`, { method: 'PATCH', body: JSON.stringify({ welcome_sent: true }) });
  }
  return res.status(200).json({ success: true, message: 'Thank you for subscribing!' });
}
