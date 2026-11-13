/**
 * "Mishael's Assistant": a small knowledge engine that answers from what is published on this site.
 * It runs entirely in the browser (no API keys), never invents prices or promises, and offers to hand
 * the conversation over to Mishael on WhatsApp whenever it cannot answer.
 */
import {
  EMAIL,
  CARE_DISPLAY,
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

const ENTRIES: Entry[] = [
  {
    id: 'greet',
    keys: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'hola'],
    answer: () =>
      "Hello! I'm Mishael's Assistant, always online. Ask me about Mishael's packages, portfolio, or how to start a project.",
    chips: [ask('What packages do you offer?'), ask('Show me all packages'), ask('How do I contact Mishael?')],
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
    chips: [ask('What packages do you offer?'), ask('Show me the portfolio')],
  },
  {
    id: 'stack',
    keys: ['react', 'typescript', 'node', 'python', 'figma', 'tech stack', 'technology', 'skill', 'tools', 'stack', 'ui ux', 'next'],
    answer: () =>
      'Mishael works with React, Next.js, TypeScript, Node.js and Python for development, Figma for UI/UX and design, plus AI/ML and brand strategy.',
    chips: [ask('Show me all packages'), ask('What packages do you offer?')],
  },
  {
    id: 'services',
    keys: ['help with', 'expertise'],
    answer: () =>
      'Mishael offers Web Development (React, Next.js, Node.js, TypeScript), Brand Design (logos, brand identity, guidelines), AI Automation (workflows, chatbots, data processing) and custom Software Development (SaaS products, databases, cloud solutions).',
    chips: [ask('Show me all packages'), ask('Show me the portfolio'), ask('How do I start a project?')],
  },
  {
    id: 'webdev',
    keys: ['web development', 'website', 'web app', 'web design', 'build a site', 'landing page', 'frontend', 'backend'],
    answer: () =>
      'Web Development: high-performance, responsive websites and web applications built with modern technologies such as React and Next.js, TypeScript and a Node.js backend, with API integration.',
    chips: [ask('Show me the portfolio'), ask('Show me all packages')],
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
    chips: [ask('Show me all packages'), ask('Show me all packages')],
  },
  {
    id: 'software',
    keys: ['software', 'saas', 'custom app', 'application', 'database', 'cloud', 'mobile app'],
    answer: () =>
      'Software Development: custom software tailored to your business, including custom applications, SaaS products, database design and cloud solutions.',
    chips: [ask('How do I start a project?'), WA_CHIP],
  },
  {
    id: 'packages',
    keys: ['package', 'bundle', 'offer', 'what do you offer', 'what service', 'your service', 'what do you do', 'what can you do', 'provide'],
    answer: () =>
      'Mishael offers five Digital Services & Packages, and each level includes more than the last:\n\n1. Starter: 2 flyers, 2 advertisement videos, Facebook, YouTube and WhatsApp setup.\n2. Mini: 4 flyers, 3 advertisement videos and social media setup.\n3. Growth: Google registration, 2 physical banners, 50 printed flyers, 2 ID cards, 6 flyers, 4 advertisement videos.\n4. Mega: Google registration, 4 physical banners, 100 printed flyers, 4 ID cards, 10 flyers, 6 advertisement videos, social media setup and management.\n5. Super: everything in Mega plus full branding, full website development and administration, full SEO, all social media platforms and monthly management.\n\nThere are also additional services, and delivery takes 24 hours.',
    chips: [ask('Tell me about the Starter Package'), ask('What are the additional services?'), ask('How fast is delivery?'), WA_CHIP],
    offerWhatsApp: true,
  },
  {
    id: 'starter',
    keys: ['starter package', 'starter'],
    answer: () =>
      'Starter Package (Level 1): 2 flyers, 2 advertisement videos and social media account setup for Facebook, YouTube and WhatsApp.',
    chips: [WA_CHIP, ask('Show me all packages')],
  },
  {
    id: 'mini',
    keys: ['mini package', 'mini'],
    answer: () => 'Mini Package (Level 2): 4 flyers, 3 advertisement videos and social media setup.',
    chips: [WA_CHIP, ask('Show me all packages')],
  },
  {
    id: 'growth',
    keys: ['growth package', 'growth'],
    answer: () =>
      'Growth Package (Level 3): Google registration, 2 physical banners, 50 printed flyers, 2 ID cards, 6 flyers and 4 advertisement videos.',
    chips: [WA_CHIP, ask('Show me all packages')],
  },
  {
    id: 'mega',
    keys: ['mega package', 'mega'],
    answer: () =>
      'Mega Package (Level 4): Google registration, 4 physical banners, 100 printed flyers, 4 ID cards, 10 flyers, 6 advertisement videos, social media setup and social media management.',
    chips: [WA_CHIP, ask('Show me all packages')],
  },
  {
    id: 'super',
    keys: ['super package', 'super', 'everything', 'complete', 'full package'],
    answer: () =>
      'Super Package (Level 5): everything in the Mega Package plus full branding, full website development and administration, full SEO packages, setup of all social media platforms, monthly social media management and business cards.',
    chips: [WA_CHIP, ask('Show me all packages')],
  },
  {
    id: 'additional',
    keys: ['additional service', 'additional', 'add on', 'add-on', 'extra', 'id card', 'business card', 'banner', 'ssd', 'custom design', 'daily post', 'social media post', 'social media management'],
    answer: () =>
      'Additional services: SSD optimization, social media management, up to 8 ID cards, 7 social media posts/flyers for daily posting, custom designs, business cards and physical banners.',
    chips: [WA_CHIP, ask('Show me all packages')],
  },
  {
    id: 'portfolio',
    keys: ['portfolio', 'project', 'work', 'sample', 'example', 'gallery', 'previous', 'showcase', 'case study'],
    answer: (ctx) => {
      const list = ctx.folders.length
        ? ctx.folders.map((f) => `${f.name} (${f.count})`).join(', ')
        : 'Web Development, Live Websites, Flyers & Graphics, Brand Design, AI Automation, Videos and Motion Graphics';
      return `The portfolio is organised in folders: ${list}. Open the Portfolio section on the home page and tap a folder to browse its full gallery.`;
    },
    chips: [{ label: 'Open the portfolio', kind: 'portfolio' }, ask('What packages do you offer?')],
  },
  {
    id: 'contact',
    keys: ['contact', 'phone', 'call', 'email', 'reach', 'number', 'whatsapp', 'talk to', 'speak to', 'message'],
    answer: () =>
      `You can reach Mishael here:\nCalls, WhatsApp chats and package or project enquiries: ${WHATSAPP_DISPLAY}\nCustomer care: ${CARE_DISPLAY}\nEmail: ${EMAIL}`,
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
    keys: ['how long', 'deadline', 'timeline', 'turnaround', 'delivery', 'deliver', 'how fast', 'duration', 'time frame', 'timeframe', '24 hour', 'fast'],
    answer: () =>
      'Delivery is fast: you get your designs within 24 hours, and your projects within 24 hours too (depending on project scope).',
    chips: [WA_CHIP, ask('Show me all packages')],
  },
  {
    id: 'start',
    keys: ['start a project', 'how do i start', 'start project', 'start', 'hire', 'get started', 'work with', 'order', 'available', 'availability', 'new project', 'begin', 'collaborate'],
    answer: () =>
      "Mishael is available for new projects. The quickest way to start is to message him on WhatsApp with a short description of what you want, and he'll reply there.",
    chips: [WA_CHIP, ask('What packages do you offer?')],
    offerWhatsApp: true,
  },
  {
    id: 'thanks',
    keys: ['thank', 'thanks', 'thx', 'appreciate', 'great', 'nice', 'cool', 'awesome'],
    answer: () => "You're welcome! Anything else you'd like to know?",
    chips: [ask('What packages do you offer?'), WA_CHIP],
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
      chips: [WA_CHIP, ask('What packages do you offer?')],
      offerWhatsApp: false,
    };
  }
  return { text: best.answer(ctx), chips: best.chips ?? [], offerWhatsApp: best.offerWhatsApp };
}

export const WELCOME: Reply = {
  text: "Hi, I'm Mishael's Assistant, always online. Ask me anything about Mishael's work, packages and services, or how to get a project started.",
  chips: [ask('What packages do you offer?'), ask('Show me all packages'), ask('Show me the portfolio'), ask('How do I contact Mishael?')],
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
