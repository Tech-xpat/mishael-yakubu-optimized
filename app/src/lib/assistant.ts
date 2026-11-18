/**
 * "Mishael's Assistant": a small knowledge engine that answers from what is published on this site.
 * It runs entirely in the browser (no API keys), never invents prices or promises, and offers to hand
 * the conversation over to Mishael on WhatsApp whenever it cannot answer.
 */
import { clauses, compile, knownRatio, minScore, rank, tokens, type Topic } from './nlu';
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
  /** Which topics answered (useful for tests). */
  topics?: string[];
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

interface Entry {
  id: string;
  keys: string[];
  answer: (ctx: KnowledgeContext) => string;
  chips?: Chip[];
  offerWhatsApp?: boolean;
  /** Only matches when the whole message is one of the keys (for short words like "ok" or "no"). */
  exact?: boolean;
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
    keys: ['who are you', 'are you a bot', 'are you human', 'are you real', 'are you ai', 'your name', 'what are you', 'assistant', 'chatgpt', 'gpt', 'robot', 'real person', 'real human', 'machine', 'are you a person', 'what should i call you', 'who am i talking'],
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
    keys: ['react', 'typescript', 'node', 'python', 'figma', 'tech stack', 'technology', 'skill', 'tools', 'stack', 'ui ux', 'next', 'tech', 'programming language', 'framework', 'nextjs'],
    answer: () =>
      'Mishael works with React, Next.js, TypeScript, Node.js and Python for development, Figma for UI/UX and design, plus AI/ML and brand strategy.',
    chips: [ask('Show me all packages'), ask('What packages do you offer?')],
  },
  {
    id: 'services',
    keys: ['expertise', 'what do you specialise in', 'what are you good at'],
    answer: () =>
      'Mishael offers Web Development (React, Next.js, Node.js, TypeScript), Brand Design (logos, brand identity, guidelines), AI Automation (workflows, chatbots, data processing) and custom Software Development (SaaS products, databases, cloud solutions).',
    chips: [ask('Show me all packages'), ask('Show me the portfolio'), ask('How do I start a project?')],
  },
  {
    id: 'webdev',
    keys: ['web development', 'website', 'web app', 'web design', 'build a site', 'landing page', 'frontend', 'backend', 'online', 'internet', 'shop', 'store', 'online store', 'ecommerce', 'e-commerce', 'store online', 'shop online', 'put my business online'],
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
    keys: ['software', 'saas', 'custom app', 'application', 'database', 'cloud', 'mobile app', 'app', 'android', 'ios', 'play store'],
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
    keys: ['super package', 'super', 'full package'],
    answer: () =>
      'Super Package (Level 5): everything in the Mega Package plus full branding, full website development and administration, full SEO packages, setup of all social media platforms, monthly social media management and business cards.',
    chips: [WA_CHIP, ask('Show me all packages')],
  },
  {
    id: 'additional',
    keys: ['additional service', 'additional', 'add on', 'add-on', 'extra', 'id card', 'business card', 'banner', 'ssd', 'custom design', 'daily post', 'social media post', 'social media management', 'manage', 'management', 'run social media', 'monthly', 'handle my page'],
    answer: () =>
      'Additional services: SSD optimization, social media management, up to 8 ID cards, 7 social media posts/flyers for daily posting, custom designs, business cards and physical banners.',
    chips: [WA_CHIP, ask('Show me all packages')],
  },
  {
    id: 'portfolio',
    keys: ['portfolio', 'project', 'work', 'sample', 'example', 'gallery', 'previous', 'showcase', 'case study', 'stuff', 'past work', 'previous work', 'your work', 'show', 'done before'],
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
    keys: ['contact', 'phone', 'call', 'email', 'reach', 'number', 'phone number', 'whatsapp', 'talk to', 'speak to', 'message', 'human', 'agent', 'representative', 'directly'],
    answer: () =>
      `You can reach Mishael here:\nCalls, WhatsApp chats and package or project enquiries: ${WHATSAPP_DISPLAY}\nCustomer care: ${CARE_DISPLAY}\nEmail: ${EMAIL}`,
    chips: [WA_CHIP],
  },
  {
    id: 'location',
    keys: ['where is', 'where are you', 'where do you', 'shop', 'store', 'branch', 'location', 'located', 'ughelli', 'delta', 'nigeria', 'office', 'address', 'based', 'city', 'state', 'country', 'visit', 'come to you', 'physical'],
    answer: () => 'Mishael and Empire Digitals Worldwide are based in Ughelli, Delta State, Nigeria. Most work is done online and over WhatsApp, so you can work with him from anywhere.',
    chips: [ask('How do I contact Mishael?')],
  },
  {
    id: 'pricing',
    keys: ['price', 'pricing', 'cost', 'how much', 'quote', 'rate', 'charge', 'budget', 'fee', 'afford', 'cheap', 'discount', 'negotiate', 'bargain', 'promo', 'coupon', 'reduce', 'lower'],
    answer: () =>
      "There are no fixed prices published on this site, because cost depends on what you need. Mishael can give you a quote once he knows your project.",
    chips: [WA_CHIP, ask('How do I start a project?')],
    offerWhatsApp: true,
  },
  {
    id: 'timeline',
    keys: ['how long', 'deadline', 'timeline', 'turnaround', 'delivery', 'deliver', 'how fast', 'duration', 'time frame', 'timeframe', '24 hour', 'fast', 'when', 'ready', 'tomorrow', 'overnight', 'urgent'],
    answer: () =>
      'Delivery is fast: you get your designs within 24 hours, and your projects within 24 hours too (depending on project scope).',
    chips: [WA_CHIP, ask('Show me all packages')],
  },
  {
    id: 'start',
    keys: ['start a project', 'how do i start', 'start project', 'start', 'hire', 'get started', 'work with', 'order', 'available', 'availability', 'new project', 'begin', 'collaborate', 'job', 'interested', 'work together', 'join'],
    answer: () =>
      "Mishael is available for new projects. The quickest way to start is to message him on WhatsApp with a short description of what you want, and he'll reply there.",
    chips: [WA_CHIP, ask('What packages do you offer?')],
    offerWhatsApp: true,
  },
  {
    id: 'owner',
    keys: ['owner', 'who owns', 'who made', 'who built', 'who created', 'creator', 'your boss', 'boss', 'who runs', 'behind this', 'who developed', 'who designed this', 'your maker', 'who is in charge', 'who manage', 'who trained you'],
    answer: () =>
      "This website and I belong to Mishael Yakubu, the founder and CEO of Empire Digitals Worldwide. He is a web developer, brand designer and AI automation specialist based in Ughelli, Delta State, Nigeria, and he built this site himself.",
    chips: [ask('Where is Mishael based?'), ask('Where is the business headed?'), WA_CHIP],
  },
  {
    id: 'company',
    keys: ['empire digitals', 'empire digital', 'your company', 'your business', 'the company', 'your agency', 'what is empire', 'about the business', 'about your business', 'worldwide'],
    answer: () =>
      'Empire Digitals Worldwide is a digital agency founded by Mishael Yakubu. It builds websites, brand identities and AI automation, and offers ready-made Digital Services & Packages for businesses that want to get online fast, with delivery in 24 hours.',
    chips: [ask('Show me all packages'), ask('Where is the business headed?')],
  },
  {
    id: 'vision',
    keys: ['where is the business headed', 'business headed', 'vision', 'mission', 'future', 'goal', 'plans', 'going next', 'growing', 'direction', 'what next', 'roadmap', 'where are you going', 'aim', 'purpose'],
    answer: () =>
      "Empire Digitals Worldwide is growing around three things: websites and brand design, AI automation (WhatsApp bots, assistants and workflows), and training people to build digital products themselves. The aim is simple: help businesses in Nigeria and beyond get online quickly, look professional and save time with automation.",
    chips: [ask('What is AI automation?'), ask('Show me all packages'), WA_CHIP],
  },
  {
    id: 'training',
    keys: ['training', 'teach', 'course', 'class', 'learn', 'student', 'tutor', 'mentor', 'coaching', 'coach', 'lesson', 'academy', 'internship', 'intern', 'apprentice', 'apprenticeship'],
    answer: () =>
      'Mishael also trains and mentors people who want to learn to build digital products. Class details change from time to time, so the best way to get the current information is to ask him on WhatsApp.',
    chips: [WA_CHIP, ask('Who is Mishael?')],
    offerWhatsApp: true,
  },
  {
    id: 'bots',
    keys: ['whatsapp bot', 'chatbot', 'chat bot', 'bot for my', 'bot for business', 'build a bot', 'telegram bot', 'ai assistant', 'virtual assistant', 'auto reply', 'auto-reply', 'customer service bot', 'order bot', 'answer customers', 'reply customers', 'ai that answers'],
    answer: () =>
      'Yes, Mishael builds WhatsApp bots, chatbots and AI assistants that answer customers, take orders and notify you when a human is needed. See the live demo near the top of the home page, and message him on WhatsApp to scope one for your business.',
    chips: [WA_CHIP, ask('What is AI automation?')],
    offerWhatsApp: true,
  },
  {
    id: 'seo',
    keys: ['seo', 'google registration', 'google business', 'google my business', 'rank on google', 'search engine', 'show on google', 'google map'],
    answer: () =>
      'Google registration is included from the Growth Package upward, and full SEO packages come with the Super Package. SEO helps your business show up when people search for you on Google.',
    chips: [ask('Show me all packages'), WA_CHIP],
  },
  {
    id: 'video',
    keys: ['video', 'advert', 'advertisement', 'ad video', 'commercial', 'motion graphic', 'animation', 'reel'],
    answer: () =>
      'Advertisement videos are part of every package: 2 in Starter, 3 in Mini, 4 in Growth and 6 in Mega. The portfolio also has a Videos and Motion Graphics folder you can browse.',
    chips: [{ label: 'Open the portfolio', kind: 'portfolio' }, ask('Show me all packages')],
  },
  {
    id: 'social',
    keys: ['facebook', 'youtube', 'linkedin', 'github', 'social media', 'social link', 'follow you', 'follow mishael', 'instagram', 'twitter', 'tiktok', 'channel'],
    answer: () =>
      'You can find Mishael on Facebook, YouTube (@mishaelautomation), LinkedIn and GitHub (Mperomishael). The links are in the footer at the bottom of every page. I do not have an Instagram or Twitter account to share.',
    chips: [WA_CHIP],
  },
  {
    id: 'support',
    keys: ['customer care', 'customer service', 'customer support', 'support', 'complaint', 'problem with', 'issue with', 'refund', 'after delivery'],
    answer: () =>
      `For customer care, call or message ${CARE_DISPLAY}. For new enquiries and project chats, use ${WHATSAPP_DISPLAY}. I can also carry this conversation over to WhatsApp so you do not have to repeat yourself.`,
    chips: [WA_CHIP],
    offerWhatsApp: true,
  },
  {
    id: 'remote',
    keys: ['remote', 'outside nigeria', 'abroad', 'international', 'lagos', 'abuja', 'warri', 'port harcourt', 'other country', 'worldwide client', 'ghana', 'uk', 'usa', 'canada', 'online client', 'work with people', 'clients in', 'customers in', 'people in', 'serve people'],
    answer: () =>
      'Mishael is based in Ughelli, Delta State, but he works with clients anywhere. Everything is done online and over WhatsApp, so being in a different city or country is not a problem.',
    chips: [WA_CHIP, ask('How do I start a project?')],
  },
  {
    id: 'hours',
    keys: ['opening hour', 'working hour', 'what time', 'when are you', 'open now', 'office hour', 'weekend', 'sunday', 'reply time', 'response time', 'how soon', 'reply fast', 'respond', 'reply', 'online', 'are you online', 'weekend'],
    answer: () =>
      "I'm online all the time. Mishael replies on WhatsApp as soon as he can, and delivery on packages is within 24 hours once a project starts.",
    chips: [WA_CHIP],
  },
  {
    id: 'trust',
    keys: ['testimonial', 'review', 'client', 'reference', 'trust', 'legit', 'genuine', 'scam', 'reliable', 'proof', 'guarantee', 'revision', 'payment', 'pay', 'deposit', 'installment', 'transfer', 'accept', 'card'],
    answer: () =>
      "I don't have published reviews, payment terms or revision policies on this site, and I would rather not guess about them. The portfolio shows real work, and Mishael can answer questions about payment and revisions directly on WhatsApp.",
    chips: [{ label: 'Open the portfolio', kind: 'portfolio' }, WA_CHIP],
    offerWhatsApp: true,
  },
  {
    id: 'site-help',
    keys: ['dark mode', 'light mode', 'theme', 'sound', 'mute', 'volume', 'video sound', 'how to use this site', 'navigate', 'menu'],
    answer: () =>
      'Use the sun/moon button at the top to switch between light and dark mode, and the speaker button to turn video sound on or off. The menu button opens the About, Portfolio, Services and Contact sections.',
    chips: [ask('Show me the portfolio')],
  },
  {
    id: 'newsletter',
    keys: ['newsletter', 'updates', 'stay updated', 'mailing list', 'sign up'],
    answer: () =>
      'You can join the newsletter from the form near the bottom of the page to hear about new projects and updates. You can unsubscribe at any time from any email.',
    chips: [ask('How do I contact Mishael?')],
  },
  {
    id: 'wellbeing',
    keys: ['how are you', 'how r u', 'how are u', 'hope you are well'],
    answer: () => "I'm doing great, thanks for asking! I'm an automated assistant, so I'm always online. How can I help you today?",
    chips: [ask('What packages do you offer?'), ask('Who is Mishael?'), ask('How do I contact Mishael?')],
  },
  {
    id: 'help',
    keys: ['help', 'what can you answer', 'what can i ask', 'options', 'menu of questions', 'commands', 'what do you know'],
    answer: () =>
      'I can tell you about Mishael and Empire Digitals Worldwide, the five service packages and add-ons, the portfolio, delivery time, where he is based and how to contact him. Pick a topic below or just type your question.',
    chips: [ask('Who is Mishael?'), ask('What packages do you offer?'), ask('Where is the business headed?'), ask('How do I contact Mishael?')],
  },
  {
    id: 'personal',
    keys: ['married', 'girlfriend', 'wife', 'age', 'how old', 'salary', 'net worth', 'religion', 'tribe', 'home address', 'house'],
    answer: () =>
      "I only share business information about Mishael, so I can't help with personal questions. I can tell you about his work, packages and how to reach him.",
    chips: [ask('Who is Mishael?'), ask('What packages do you offer?')],
  },
  {
    id: 'rude',
    keys: ['stupid', 'idiot', 'useless', 'dumb', 'nonsense', 'rubbish', 'hate you', 'worst'],
    answer: () =>
      "Sorry I wasn't more helpful. I only know what's published on this website, but Mishael can answer anything else directly. Would you like to continue on WhatsApp?",
    chips: [WA_CHIP, ask('What can you answer?')],
  },
  {
    id: 'fun',
    keys: ['joke', 'love you', 'i love', 'sing', 'poem', 'story', 'weather', 'football', 'president', 'news'],
    answer: () =>
      "That's a bit outside what I know. I'm best at questions about Mishael's work, packages and how to start a project. Want me to show you what I can answer?",
    chips: [ask('What can you answer?'), ask('What packages do you offer?')],
  },
  {
    id: 'ack',
    exact: true,
    keys: ['ok', 'okay', 'alright', 'fine', 'sure', 'yes', 'yeah', 'yep', 'yup', 'no', 'nope', 'hmm', 'hmmm', 'k', 'oh', 'i see', 'got it', 'noted', 'cool'],
    answer: () => 'Alright. What would you like to know about Mishael, the packages or the portfolio?',
    chips: [ask('What packages do you offer?'), ask('Show me the portfolio'), WA_CHIP],
  },
  {
    id: 'thanks',
    keys: ['thank', 'thanks', 'thx', 'appreciate', 'great', 'nice', 'cool', 'awesome', 'amazing', 'love', 'beautiful', 'impressive', 'wonderful', 'perfect', 'good job', 'well done', 'excellent'],
    answer: () => "You're welcome! Anything else you'd like to know?",
    chips: [ask('What packages do you offer?'), WA_CHIP],
  },
  {
    id: 'bye',
    keys: ['bye', 'goodbye', 'see you later', 'see you soon', 'later', 'good night', 'take care', 'catch you later', 'cheers', 'ciao'],
    answer: () => "Goodbye! I'm always here if you have more questions, and Mishael is on WhatsApp whenever you're ready.",
    chips: [WA_CHIP],
  },
];

/* ---------- greetings, typos and matching ---------- */

const GREETING_WORDS =
  /\b(?:hi+|hey+|hello+|helo+|hallo|hola|howdy|yo+|sup|wass?up|whatsup|salam|salaam|good\s*(?:morning|afternoon|evening|day)|morning|afternoon|evening|how\s*far|how\s*you\s*dey|wetin\s*dey|what'?s\s*up|how\s*are\s*(?:you|u)|how\s*r\s*u|how'?s\s*it\s*going|hope\s*you(?:'re|\s*are)?\s*(?:well|good|fine|doing\s*well)|what\s*(?:is|s)?\s*up|nice\s*to\s*meet\s*you|greetings|good\s*to\s*see\s*you)\b/g;
const FILLER = /\b(?:there|everyone|everybody|mishael|assistant|bot|sir|ma|madam|oga|boss|dear|friend|please|pls|abeg|again|all|o|oh|the|team|guys|folks|my|doing|today|going|hope|well|fine|good|great|you|u|are|is|it|so|far|there)\b/g;
const WELLBEING = /how\s*(?:are|r)\s*(?:you|u)|how'?s\s*it\s*going|how\s*you\s*dey|wetin\s*dey|hope\s*you/;

function lagosHour(): number {
  try {
    return Number(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hour12: false, timeZone: 'Africa/Lagos' }).format(new Date())) % 24;
  } catch {
    return new Date().getHours();
  }
}
/** Mirror the time of day the visitor said; otherwise use the real time in Ughelli. */
const greetingWord = (said: string) => {
  const m = said.match(/\b(morning|afternoon|evening)\b/);
  if (m) return `Good ${m[1]}!`;
  const h = lagosHour();
  return h < 12 ? 'Good morning!' : h < 17 ? 'Good afternoon!' : 'Good evening!';
};

const GREETING_REPLY: Reply = {
  text: "Hello! I'm Mishael's Assistant, always online. Ask me about Mishael, Empire Digitals Worldwide, the packages, the portfolio, or how to start a project.",
  chips: [ask('What packages do you offer?'), ask('Who is Mishael?'), ask('How do I contact Mishael?')],
};

const NO_MATCH: Reply = {
  text: "I don't have that detail on the site, and I'd rather not guess. Mishael can answer it directly. Would you like to continue this chat on WhatsApp?",
  chips: [WA_CHIP, ask('What can you answer?'), ask('What packages do you offer?')],
  offerWhatsApp: false,
};

/* ---------- the keyword engine: which topics each entry answers ---------- */

/** Extra hints per topic: strong keywords (count most) and the question words that favour it. */
const META: Record<string, { strong?: string[]; on?: string[]; deny?: string[]; maxTokens?: number }> = {
  identity: { strong: ['chatgpt', 'gpt'], on: ['who', 'what'] },
  about: { strong: ['founder', 'ceo', 'yakubu', 'experience'], on: ['who'] },
  owner: {
    strong: ['owner:5', 'creator', 'boss', 'maker'],
    on: ['who'],
    deny: ['\\b(?:business|shop|store|restaurant|church|school|brand|company|salon)\\s+owner', '\\bi\\s*(?:am|m)?\\s*(?:the|a)?\\s*owner\\b', '\\bi own\\b'],
  },
  company: { strong: ['empire'], on: ['what'] },
  vision: { strong: ['vision', 'mission', 'roadmap', 'future:5'], on: ['where', 'what'] },
  location: { strong: ['location', 'ughelli', 'delta', 'nigeria', 'branch'], on: ['where'] },
  remote: { strong: ['abroad', 'international', 'remote', 'lagos', 'abuja', 'warri'] },
  pricing: { strong: ['price', 'discount', 'negotiate', 'bargain'], on: ['how'] },
  packages: { strong: ['package'], on: ['what'] },
  starter: { strong: ['starter'] },
  mini: { strong: ['mini'] },
  growth: { strong: ['growth'] },
  mega: { strong: ['mega'] },
  super: { strong: ['super'] },
  additional: { strong: ['additional', 'banner', 'ssd', 'manage', 'management'] },
  portfolio: { strong: ['portfolio', 'gallery', 'showcase'] },
  contact: { strong: ['contact', 'speak', 'talk', 'human', 'agent', 'representative'] },
  timeline: { strong: ['time', 'ready', 'tomorrow', 'overnight', 'urgent'], on: ['how', 'when'] },
  start: { strong: ['start', 'hire', 'available', 'availability', 'interested'], on: ['how'] },
  bots: { strong: ['chatbot'] },
  seo: { strong: ['seo'] },
  video: { strong: ['video', 'advert'] },
  social: {
    strong: ['facebook', 'youtube', 'linkedin', 'github', 'instagram', 'twitter', 'tiktok'],
    deny: ['\\b(?:clone|build|make|create|develop|app)\\b', '\\b(?:my|our)\\s+(?:own\\s+)?(?:facebook|youtube|instagram|linkedin|twitter|tiktok|social|page|account|channel)', '\\b(?:run|manage|handle|management|monthly)\\b'],
  },
  support: { strong: ['refund', 'complaint', 'bug:5', 'broken:5', 'error:5', 'crash:5', 'glitch:5', 'loading:5'] },
  webdev: { strong: ['website'] },
  brand: { strong: ['logo', 'flyer', 'branding', 'brand'] },
  ai: { strong: ['automation', 'automate'] },
  software: { strong: ['software', 'saas', 'clone'] },
  help: { strong: ['help'], on: ['what'] },
  'site-help': { strong: ['sound', 'mute', 'volume', 'theme'] },
  training: { strong: ['learn:5', 'internship', 'intern', 'apprentice'] },
  thanks: { maxTokens: 6, deny: ['\\?', '\\b(?:what|who|where|how|why|when|which)\\b'], strong: ['thank', 'great:4.5', 'nice:4.5', 'awesome:4.5', 'amazing:4.5', 'love:4.5', 'beautiful:4.5', 'impressive:4.5', 'wonderful:4.5', 'excellent:4.5'] },
  bye: { strong: ['bye', 'goodbye'] },
  personal: { on: ['how'] },
  trust: { strong: ['pay', 'payment', 'transfer', 'deposit', 'installment', 'paystack'] },
  stack: { strong: ['technology', 'stack', 'tech', 'react', 'typescript', 'figma', 'tool', 'skill', 'framework'] },
  newsletter: { strong: ['newsletter'] },
};

const TOPICS: Topic[] = ENTRIES.filter((e) => e.id !== 'greet' && e.id !== 'wellbeing').map((e) => ({ id: e.id, keys: e.keys, exact: e.exact, ...(META[e.id] ?? {}) }));
compile(TOPICS);
const BY_ID = new Map(ENTRIES.map((e) => [e.id, e]));

/** Topics that overlap on purpose: a message about one rarely needs the others added. */
const PLANS = ['starter', 'mini', 'growth', 'mega', 'super'];
const FAMILY = ['packages', ...PLANS, 'additional'];

/** Which topics a piece of text is about: one clear topic, or two when the visitor asked two things. */
function resolve(text: string): Entry[] {
  const hits: Entry[] = [];
  const parts = clauses(text);
  if (parts.length > 1) {
    for (const part of parts) {
      const top = rank(part)[0];
      if (top && top.score >= minScore(part)) {
        const e = BY_ID.get(top.topic.id)!;
        if (!hits.includes(e)) hits.push(e);
      }
    }
  }
  if (hits.length >= 2) return hits.slice(0, 2);

  const scored = rank(text);
  const top = scored[0];
  if (!top || top.score < minScore(text)) return hits;
  // Mostly words the assistant has never heard of, plus one lucky keyword: do not pretend to understand.
  if (tokens(text).length >= 5 && top.score < 7 && knownRatio(text) < 0.3) return hits;
  const out = [BY_ID.get(top.topic.id)!];
  const next = scored[1];
  if (
    next &&
    next.score >= 2.5 &&
    next.score >= 0.6 * top.score &&
    !(FAMILY.includes(top.topic.id) && FAMILY.includes(next.topic.id) && !(PLANS.includes(top.topic.id) && PLANS.includes(next.topic.id)))
  ) {
    out.push(BY_ID.get(next.topic.id)!);
  }
  return out;
}

export function answer(question: string, ctx: KnowledgeContext): Reply {
  try {
    const raw = question.slice(0, 400).toLowerCase().replace(/\bgud\b/g, 'good').replace(/\bmornin\b/g, 'morning').trim();
    if (!/[a-z0-9]/.test(raw)) {
      return { text: "I didn't catch that. Try asking about the packages, the portfolio, or how to reach Mishael.", chips: [ask('What can you answer?'), ask('What packages do you offer?')] };
    }

    // Goodbyes win over "good night" being read as a greeting.
    if (/\bgood\s*night\b/.test(raw)) {
      const bye = BY_ID.get('bye')!;
      return { text: bye.answer(ctx), chips: bye.chips ?? [], topics: ['bye'] };
    }

    const hadGreeting = (raw.match(GREETING_WORDS) || []).length > 0;
    const stripped = raw.replace(GREETING_WORDS, ' ');
    const rest = stripped.replace(FILLER, ' ').replace(/[^a-z0-9]+/g, ' ').trim();

    if (hadGreeting && !rest) {
      if (WELLBEING.test(raw)) {
        const e = BY_ID.get('wellbeing')!;
        return { text: e.answer(ctx), chips: e.chips ?? [], topics: ['wellbeing'] };
      }
      const timed = /\b(?:good\s*)?(?:morning|afternoon|evening|day)\b/.test(raw) ? `${greetingWord(raw)} ` : 'Hello! ';
      return { ...GREETING_REPLY, text: GREETING_REPLY.text.replace(/^Hello! /, timed), topics: ['greet'] };
    }

    const body = hadGreeting ? stripped : raw;

    // Whole-message replies such as "ok", "yes", "no".
    const flat = body.replace(/(.)\1{2,}/g, '$1$1').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
    const quick = ENTRIES.find((e) => e.exact && e.keys.includes(flat));
    if (quick) return { text: quick.answer(ctx), chips: quick.chips ?? [], topics: [quick.id] };

    // "Hi, what packages do you have?": answer the question, with a greeting in front.
    const picks = resolve(body);
    if (!picks.length) return { ...NO_MATCH, topics: [] };
    const text = picks.map((p) => p.answer(ctx)).join('\n\n');
    return {
      text: hadGreeting ? `Hello! ${text}` : text,
      chips: picks[0].chips ?? [],
      offerWhatsApp: picks.some((p) => p.offerWhatsApp),
      topics: picks.map((p) => p.id),
    };
  } catch {
    return NO_MATCH;
  }
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
