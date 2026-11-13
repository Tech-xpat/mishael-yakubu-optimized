import { type Req, type Res, db, checkToken } from './_lib.js';

export default async function handler(req: Req, res: Res) {
  const email = String(req.query?.email || '').toLowerCase();
  const token = String(req.query?.token || '');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const page = (m: string) => `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:Arial;display:grid;place-items:center;min-height:100vh;margin:0;background:#0a0a0a;color:#fff;text-align:center;padding:24px"><div><h2>${m}</h2><p><a style="color:#fff" href="/">Back to the site</a></p></div></body>`;
  if (!email || !checkToken(email, token)) return res.status(400).send(page('This unsubscribe link is not valid.'));
  await db(`subscribers?email=eq.${encodeURIComponent(email)}`, { method: 'PATCH', body: JSON.stringify({ status: 'unsubscribed' }) });
  return res.status(200).send(page('You have been unsubscribed.'));
}
