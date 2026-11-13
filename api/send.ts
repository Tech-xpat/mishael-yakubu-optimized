import { type Req, type Res, db, requireAdmin, sendMail, templates, unsubLink, RESEND_KEY } from './_lib.js';

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });
  if (!(await requireAdmin(req))) return res.status(401).json({ success: false, message: 'Admin sign-in required' });
  if (!RESEND_KEY) return res.status(500).json({ success: false, message: 'RESEND_API_KEY is not set on the server' });

  const { type, subject, content, projectName, category } = req.body || {};
  const r = await db('subscribers?select=email&status=eq.active');
  const list = r.ok ? ((await r.json()) as { email: string }[]) : [];
  if (!list.length) return res.status(200).json({ success: false, message: 'No active subscribers yet' });

  let title: string;
  let build: (unsub: string) => string;
  if (type === 'announcement') {
    if (!projectName) return res.status(400).json({ success: false, message: 'Project name required' });
    title = `New ${category || 'project'}: ${projectName}`;
    build = (u) => templates.announcement(String(projectName), String(category || 'Project'), u);
  } else {
    if (!subject || !content) return res.status(400).json({ success: false, message: 'Subject and content required' });
    title = String(subject);
    build = (u) => templates.newsletter(String(subject), String(content), u);
  }

  let sent = 0;
  for (const { email } of list) {
    if (await sendMail(email, title, build(unsubLink(email)))) sent++;
  }
  return res.status(200).json({ success: sent > 0, message: `Sent to ${sent} of ${list.length} subscribers` });
}
