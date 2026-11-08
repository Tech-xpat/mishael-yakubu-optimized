/**
 * "Mishael's Assistant": a small knowledge engine that answers from what is published on this site.
 * It runs entirely in the browser (no API keys), never invents prices or promises, and offers to hand
 * the conversation over to Mishael on WhatsApp whenever it cannot answer.
 */
import {
  EMAIL,
  PHONE_DISPLAY,
  SERVICES_WHATSAPP_DISPLAY,
  WHATSAPP_DISPLAY,
  WHATSAPP_INTL,
} from './contact';

export type ChipKind = 'ask' | 'whatsapp' | 'portfolio';
export interface Chip {
  label: string;
  kind: ChipKind;
}
export interface ChatMessage {
  id: number;
  role: 'bot' | 'user';
  text: string;
  chips?: Chip[];
}
export interface Reply {
  text: string;
  chips: Chip[];
  /** true when the answer should also ask "would you prefer WhatsApp?" */
  offerWhatsApp?: boolean;
}
export interface KnowledgeContext {
  /** Portfolio folders with how many projects each holds (live from the database). */
  folders: { name: string; count: number }[];
}

const ask = (label: string): Chip => ({ label, kind: 'ask' });
export const WA_CHIP: Chip = { label: 'Continue on WhatsApp', kind: 'whatsapp' };

/* ---------- text matching ---------- */

const norm = (s: string) =>
  ' ' +
  s
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w))
    .join(' ') +
  ' ';

interface Entry {
  id: string;
  keys: string[];
  answer: (ctx: KnowledgeContext) => string;
  chips?: Chip[];
  offerWhatsApp?: boolean;
}

const INTEGRATIONS: { name: string; keys: string[]; blurb: string }[] = [
  { name: 'WhatsApp Business API', keys: ['whatsapp api', 'whatsapp business', 'business api', 'whatsapp integration'], blurb: 'connects your website to WhatsApp so customers can reach you and get automated replies where they already chat.' },
  { name: 'Payment Gateway Integration', keys: ['payment', 'gateway', 'paystack', 'flutterwave', 'stripe', 'checkout', 'accept payment'], blurb: 'lets visitors pay you directly on your website.' },
  { name: 'Online Booking / Appointment System', keys: ['booking', 'appointment', 'schedule', 'reservation'], blurb: 'lets customers book a time with you online instead of going back and forth.' },
  { name: 'E-commerce Integration', keys: ['ecommerce', 'e commerce', 'online store', 'online shop', 'shop', 'store', 'sell online'], blurb: 'turns your website into a store where people can browse and buy.' },
  { name: 'Customer Relationship Management (CRM) Integration', keys: ['crm', 'customer relationship'], blurb: 'sends your website enquiries into a CRM so every customer and follow-up is tracked in one place.' },
  { name: 'Email Marketing Automation', keys: ['email marketing', 'newsletter', 'mailing list', 'email automation', 'drip'], blurb: 'sends the right emails to your contacts automatically.' },
  { name: 'AI Chatbot Integration', keys: ['chatbot', 'chat bot', 'bot', 'ai chat'], blurb: 'adds a chatbot to your site that answers visitors any time of day.' },
  { name: 'Customer Support Automation', keys: ['support automation', 'customer support', 'helpdesk', 'help desk', 'support'], blurb: 'automates common support replies and routes the rest to you.' },
  { name: 'Lead Generation System', keys: ['lead generation', 'lead', 'capture lead', 'get customer'], blurb: 'captures enquiries from your website and organises them so nothing is missed.' },
  { name: 'Google Analytics & Conversion Tracking', keys: ['google analytics', 'analytics', 'conversion tracking', 'tracking', 'traffic'], blurb: 'shows who visits your site and which actions turn visitors into customers.' },
  { name: 'Google Search Console Integration', keys: ['search console', 'seo', 'google search', 'rank', 'indexing'], blurb: 'connects your site to Google Search Console so you can see how you appear in search.' },
  { name: 'Facebook Pixel / Meta Conversion API', keys: ['facebook pixel', 'meta pixel', 'meta conversion', 'conversion api', 'pixel', 'facebook ads', 'instagram ads', 'meta ads'], blurb: 'tracks results from your Facebook and Instagram ads so you can see what pays off.' },
  { name: 'Third-Party API Integrations', keys: ['third party', 'api', 'connect tool', 'integrate with'], blurb: 'connects your website to other services and tools you already use.' },
  { name: 'Website Security and Backup Integration', keys: ['security', 'backup', 'secure', 'hack', 'protect', 'ssl'], blurb: 'protects your website and keeps backups so you can recover if something goes wrong.' },
  { name: 'Automated Notifications and Email Systems', keys: ['notification', 'automated email', 'auto email', 'alert', 'confirmation email'], blurb: 'sends customers and you instant notifications and emails when something happens on your site.' },
];

const ENTRIES: Entry[] = [
  {
    id: 'greet',
    keys: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'hola'],
    answer: () =>
      "Hello! I'm Mishael's Assistant, always online. Ask me about Mishael's services, website integrations, portfolio, or how to start a project.",
    chips: [ask('What services do you offer?'), ask('Show me the integrations'), ask('How do I contact Mishael?')],
  },
  {
    id: 'identity',
    keys: ['who are you', 'are you a bot', 'are you human', 'are you real', 'are you ai', 'your name', 'what are you', 'assistant'],
    answer: () =>
      "I'm Mishael's Assistant, an automated assistant that's always online. I answer from the information on this website. If you'd rather speak to Mishael himself, I can carry our whole conversation over to WhatsApp.",
    chips: [ask('Who is Mishael?'), WA_CHIP],
  },
  {
    id: 'about',
    keys: ['who is mishael', 'about mishael', 'about you', 'background', 'experience', 'ceo', 'empire digital', 'founder', 'yakubu', 'years'],
    answer: () =>
      "Mishael Yakubu is a web developer, brand designer and AI automation specialist, and the CEO of Empire Digitals, based in Ughelli, Delta State, Nigeria. He has over 5 years of experience in the digital space and has worked with startups, agencies and established brands across different industries.",
    chips: [ask('What services do you offer?'), ask('Show me the portfolio')],
  },
  {
    id: 'stack',
    keys: ['react', 'typescript', 'node', 'python', 'figma', 'tech stack', 'technology', 'skill', 'tools', 'stack', 'ui ux', 'next'],
    answer: () =>
      'Mishael works with React, Next.js, TypeScript, Node.js and Python for development, Figma for UI/UX and design, plus AI/ML and brand strategy.',
    chips: [ask('Show me the integrations'), ask('What services do you offer?')],
  },
  {
    id: 'services',
    keys: ['service', 'offer', 'what do you do', 'what can you do', 'help with', 'provide', 'expertise'],
    answer: () =>
      'Mishael offers Web Development (React, Next.js, Node.js, TypeScript), Brand Design (logos, brand identity, guidelines), AI Automation (workflows, chatbots, data processing) and custom Software Development (SaaS products, databases, cloud solutions). He also builds Advanced Website Integrations such as WhatsApp, payments, booking, CRM and analytics.',
    chips: [ask('Show me the integrations'), ask('Show me the portfolio'), ask('How do I start a project?')],
  },
  {
    id: 'webdev',
    keys: ['web development', 'website', 'web app', 'web design', 'build a site', 'landing page', 'frontend', 'backend'],
    answer: () =>
      'Web Development: high-performance, responsive websites and web applications built with modern technologies such as React and Next.js, TypeScript and a Node.js backend, with API integration.',
    chips: [ask('Show me the portfolio'), ask('Show me the integrations')],
  },
  {
    id: 'brand',
    keys: ['brand', 'logo', 'branding', 'identity', 'flyer', 'graphic', 'design'],
    answer: () =>
      'Brand Design: distinctive brand identities that communicate your values, including logo design, brand strategy, visual identity and brand guidelines. The portfolio also has flyers and graphics.',
    chips: [ask('Show me the portfolio'), WA_CHIP],
  },
  {
    id: 'ai',
    keys: ['ai automation', 'automation', 'automate', 'artificial intelligence', 'workflow', 'machine learning'],
    answer: () =>
      'AI Automation: intelligent automation to streamline workflows and boost productivity, covering workflow automation, chatbot development, data processing and AI integration.',
    chips: [ask('Tell me about chatbots'), ask('Show me the integrations')],
  },
  {
    id: 'software',
    keys: ['software', 'saas', 'custom app', 'application', 'database', 'cloud', 'mobile app'],
    answer: () =>
      'Software Development: custom software tailored to your business, including custom applications, SaaS products, database design and cloud solutions.',
    chips: [ask('How do I start a project?'), WA_CHIP],
  },
  {
    id: 'integrations',
    keys: ['integration', 'integrate', 'advanced website', 'connect my website', 'add feature', 'add-on'],
    answer: () =>
      'Advanced Website Integrations cover four areas.\n\nMessaging & Support: WhatsApp Business API, AI chatbot, customer support automation, automated notifications and emails.\nPayments & Sales: payment gateway, online booking, e-commerce, CRM.\nMarketing & Leads: lead generation, email marketing automation, Facebook Pixel / Meta Conversion API.\nAnalytics & Security: Google Analytics and conversion tracking, Google Search Console, third-party APIs, website security and backup.\n\nTell me which one you need and I can explain it, or discuss it on WhatsApp.',
    chips: [ask('Payment gateway'), ask('WhatsApp Business API'), { label: 'Discuss integrations', kind: 'whatsapp' }],
    offerWhatsApp: true,
  },
  ...INTEGRATIONS.map(
    (i): Entry => ({
      id: 'int-' + i.name,
      keys: i.keys,
      answer: () =>
        `${i.name}: this ${i.blurb} It's one of the Advanced Website Integrations Mishael builds, and the details depend on your business. Want to talk it through on WhatsApp?`,
      chips: [WA_CHIP, ask('Show me the integrations')],
      offerWhatsApp: false,
    })
  ),
  {
    id: 'portfolio',
    keys: ['portfolio', 'project', 'work', 'sample', 'example', 'gallery', 'previous', 'showcase', 'case study'],
    answer: (ctx) => {
      const list = ctx.folders.length
        ? ctx.folders.map((f) => `${f.name} (${f.count})`).join(', ')
        : 'Web Development, Live Websites, Flyers & Graphics, Brand Design, AI Automation, Videos and Motion Graphics';
      return `The portfolio is organised in folders: ${list}. Open the Portfolio section on the home page and tap a folder to browse its full gallery.`;
    },
    chips: [{ label: 'Open the portfolio', kind: 'portfolio' }, ask('What services do you offer?')],
  },
  {
    id: 'contact',
    keys: ['contact', 'phone', 'call', 'email', 'reach', 'number', 'whatsapp', 'talk to', 'speak to', 'message'],
    answer: () =>
      `You can reach Mishael here:\nWhatsApp: ${WHATSAPP_DISPLAY}\nProject and integration enquiries on WhatsApp: ${SERVICES_WHATSAPP_DISPLAY}\nPhone calls: ${PHONE_DISPLAY}\nEmail: ${EMAIL}`,
    chips: [WA_CHIP],
  },
  {
    id: 'location',
    keys: ['where', 'location', 'located', 'ughelli', 'delta', 'nigeria', 'office', 'address', 'based'],
    answer: () => 'Mishael is based in Ughelli, Delta State, Nigeria.',
    chips: [ask('How do I contact Mishael?')],
  },
  {
    id: 'pricing',
    keys: ['price', 'pricing', 'cost', 'how much', 'quote', 'rate', 'charge', 'budget', 'fee', 'afford', 'cheap', 'package'],
    answer: () =>
      "There are no fixed prices published on this site, because cost depends on what you need. Mishael can give you a quote once he knows your project.",
    chips: [WA_CHIP, ask('How do I start a project?')],
    offerWhatsApp: true,
  },
  {
    id: 'timeline',
    keys: ['how long', 'deadline', 'timeline', 'turnaround', 'delivery', 'how fast', 'duration', 'time frame', 'timeframe'],
    answer: () =>
      "I don't have set delivery times on the site. They depend on the size of the project, and Mishael can give you a realistic timeline when he hears the details.",
    chips: [WA_CHIP],
    offerWhatsApp: true,
  },
  {
    id: 'start',
    keys: ['start a project', 'how do i start', 'start project', 'start', 'hire', 'get started', 'work with', 'order', 'available', 'availability', 'new project', 'begin', 'collaborate'],
    answer: () =>
      "Mishael is available for new projects. The quickest way to start is to message him on WhatsApp with a short description of what you want, and he'll reply there.",
    chips: [WA_CHIP, ask('What services do you offer?')],
    offerWhatsApp: true,
  },
  {
    id: 'thanks',
    keys: ['thank', 'thanks', 'thx', 'appreciate', 'great', 'nice', 'cool', 'awesome'],
    answer: () => "You're welcome! Anything else you'd like to know?",
    chips: [ask('What services do you offer?'), WA_CHIP],
  },
  {
    id: 'bye',
    keys: ['bye', 'goodbye', 'see you', 'later', 'good night'],
    answer: () => "Goodbye! I'm always here if you have more questions, and Mishael is on WhatsApp whenever you're ready.",
    chips: [WA_CHIP],
  },
];

export function answer(question: string, ctx: KnowledgeContext): Reply {
  const q = norm(question);
  let best: Entry | null = null;
  let bestScore = 0;
  for (const entry of ENTRIES) {
    let score = 0;
    for (const key of entry.keys) {
      if (q.includes(norm(key))) score += 1 + (key.trim().split(' ').length - 1) * 1.5;
    }
    if (score > bestScore) {
      best = entry;
      bestScore = score;
    }
  }
  if (!best) {
    return {
      text: "I don't have that detail on the site, and I'd rather not guess. Mishael can answer it directly. Would you like to continue this chat on WhatsApp?",
      chips: [WA_CHIP, ask('What services do you offer?')],
      offerWhatsApp: false,
    };
  }
  return { text: best.answer(ctx), chips: best.chips ?? [], offerWhatsApp: best.offerWhatsApp };
}

export const WELCOME: Reply = {
  text: "Hi, I'm Mishael's Assistant, always online. Ask me anything about Mishael's work, services and website integrations, or how to get a project started.",
  chips: [ask('What services do you offer?'), ask('Show me the integrations'), ask('Show me the portfolio'), ask('How do I contact Mishael?')],
};

export const WA_PROMPT = 'By the way, would you prefer to talk on WhatsApp instead? I can carry this whole conversation over so you do not have to repeat yourself.';

/** WhatsApp message that carries the whole chat so Mishael can pick it up where the assistant stopped. */
export function buildHandoff(messages: ChatMessage[]): string {
  const head =
    'Hello Mishael, I was chatting with your assistant on your website and would like to continue here.\n\nHere is our conversation so far:\n\n';
  const lines = messages.map((m) => `${m.role === 'user' ? 'Me' : 'Assistant'}: ${m.text.replace(/\s+/g, ' ').trim()}`);
  const MAX = 1700; // keeps the wa.me link well inside what WhatsApp accepts
  let body = lines.join('\n');
  if (body.length > MAX) {
    const kept: string[] = [];
    let used = 0;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (used + lines[i].length + 1 > MAX) break;
      kept.unshift(lines[i]);
      used += lines[i].length + 1;
    }
    body = '(earlier messages trimmed)\n' + kept.join('\n');
  }
  return head + body;
}

export const handoffUrl = (messages: ChatMessage[]) =>
  `https://wa.me/${WHATSAPP_INTL}?text=${encodeURIComponent(buildHandoff(messages))}`;
