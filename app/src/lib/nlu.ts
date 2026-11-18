/**
 * A small keyword/intent engine for the site assistant. No dependencies, runs in the browser.
 *
 * A message is cleaned the same way as the assistant's keywords, so loose grammar, slang,
 * typos and extra chatter around the real question do not matter:
 *   1. lower-case, split into words, expand slang ("u" -> "you", "hw" -> "how")
 *   2. drop filler words ("please", "i", "the", "tell me")
 *   3. fix typos by snapping unknown words to the nearest word the assistant knows
 *   4. reduce words to a stem ("packages" -> "packag") and map synonyms to one head word
 *      ("cost", "fee", "rate", "charge" -> "price")
 * Each topic then scores itself on the words it recognises: strong keywords count most, phrases must
 * appear in order close together, and question words (who / where / when) add a small boost.
 * Words nobody knows ("gravity") score nothing, so they can never drag a message into a wrong topic.
 */

export interface Topic {
  id: string;
  keys: string[];
  /** Words that identify the topic almost on their own. */
  strong?: string[];
  /** Question words that make this topic more likely ("who", "where", ...). */
  on?: string[];
  exact?: boolean;
  /** Regular expressions (as text): when one matches the message, this topic is ruled out ("my own facebook page"). */
  deny?: string[];
  /** Ignore this topic for messages longer than this many meaningful words (compliments inside long messages). */
  maxTokens?: number;
}

const STOP = new Set(
  ('a an the is are am was were be been being do does did done i me my mine we our us it its this that these those to of for in on at ' +
    'with from by as or if so then than too very just please kindly can could would should will shall may might have has had get got ' +
    'want need like wanna gonna let lets tell know there here some any one also really actually maybe sir ma madam oga dear hi hello hey ' +
    'abeg pls plz yes yeah ok okay im ive id ill dont doesnt cant').split(' ')
);

const SLANG: Record<string, string> = {
  u: 'you', ur: 'your', yu: 'you', ya: 'you', r: 'are', wat: 'what', wot: 'what', wht: 'what', hw: 'how', wen: 'when', whn: 'when',
  wher: 'where', wia: 'where', whr: 'where', hu: 'who', wetin: 'what', wan: 'want', dis: 'this', dat: 'that', wit: 'with', abt: 'about',
  biz: 'business', pkg: 'package', pckg: 'package', pkgs: 'package', tnx: 'thanks', thx: 'thanks', tanx: 'thanks', cos: 'because',
  bcos: 'because', info: 'information', msg: 'message', num: 'number', no: 'no', dem: 'them', na: 'is', dey: 'is', wey: 'that',
  built: 'build', made: 'make', paid: 'pay', sent: 'send', bought: 'buy', went: 'go', gave: 'give', ran: 'run', owns: 'own', owned: 'own',
  prize: 'price', prise: 'price', whats: 'what', hows: 'how', wheres: 'where', whos: 'who', whatsap: 'whatsapp', watsapp: 'whatsapp', whatsap_: 'whatsapp', webste: 'website', wesite: 'website',
};

/** Synonym groups: every word on the right is read as the word on the left. */
const GROUPS: Record<string, string[]> = {
  price: ['cost', 'fee', 'charge', 'rate', 'pricing', 'quote', 'budget', 'expensive', 'cheap', 'afford', 'affordable', 'money', 'naira', 'amount'],
  package: ['bundle'],
  contact: ['reach', 'email', 'mail'],
  phone: ['call', 'number', 'dial', 'ring'],
  location: ['locate', 'address', 'office', 'based', 'live', 'city', 'town', 'country', 'state', 'place', 'situated'],
  owner: ['own', 'creator', 'maker', 'boss', 'owner'],
  time: ['fast', 'quick', 'speed', 'soon', 'deliver', 'delivery', 'turnaround', 'deadline', 'timeline', 'duration', 'hour', 'day', 'urgent', 'asap'],
  vision: ['mission', 'future', 'goal', 'direction', 'roadmap', 'headed', 'heading', 'grow', 'expand', 'purpose', 'ambition', 'aim'],
  website: ['site', 'webpage', 'web'],
  start: ['begin', 'commence', 'kick'],
  hire: ['employ', 'engage', 'book', 'order', 'buy', 'purchase'],
  design: ['designer', 'designing', 'graphic', 'graphics'],
  build: ['make', 'create', 'develop', 'develops', 'developer', 'code', 'program', 'programme'],
  learn: ['teach', 'train', 'training', 'tutor', 'coach', 'mentor', 'course', 'class', 'lesson', 'academy', 'student'],
  help: ['assist', 'aid'],
  show: ['see', 'view', 'display', 'preview'],
  bot: ['chatbot', 'robot', 'assistant'],
};

const IRREGULAR: Record<string, string> = {};

const stem = (w: string): string => {
  if (w.length <= 3) return w;
  let s = w;
  if (s.endsWith('ies') && s.length > 4) s = s.slice(0, -3) + 'y';
  else if (s.endsWith('sses')) s = s.slice(0, -2);
  else if (s.endsWith('ing') && s.length > 5) s = s.slice(0, -3);
  else if (s.endsWith('ed') && s.length > 4) s = s.slice(0, -2);
  else if (s.endsWith('ly') && s.length > 5) s = s.slice(0, -2);
  else if (s.endsWith('es') && s.length > 4 && /(?:ch|sh|x|z|ss)es$/.test(s)) s = s.slice(0, -2);
  else if (s.endsWith('s') && !s.endsWith('ss') && !s.endsWith('us')) s = s.slice(0, -1);
  if (s.length > 4 && s.endsWith('e')) s = s.slice(0, -1);
  return s;
};

const CANON = new Map<string, string>();
for (const [head, members] of Object.entries(GROUPS)) {
  const h = stem(head);
  for (const m of members) CANON.set(stem(m.replace(/_$/, '')), h);
}

const words = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => SLANG[w] ?? IRREGULAR[w] ?? w);

/** Every word the assistant's own keywords use (before stemming): the dictionary typos are snapped to. */
const VOCAB = new Set<string>();
/** Stems of every word the assistant understands: used to tell a real question from random text. */
const KNOWN = new Set<string>();

function distance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = row;
  }
  return prev[b.length];
}

const fixTypo = (w: string): string => {
  if (w.length < 6 || VOCAB.has(w) || STOP.has(w) || /\d/.test(w)) return w;
  const max = w.length >= 9 ? 2 : 1;
  let best = w;
  let bestD = max + 1;
  for (const v of VOCAB) {
    if (v[0] !== w[0] || v.length < 4) continue;
    const d = distance(w, v, max);
    if (d < bestD) {
      best = v;
      bestD = d;
    }
  }
  return bestD <= max ? best : w;
};

const toToken = (w: string): string => {
  const s = stem(w);
  return CANON.get(s) ?? s;
};

/** Message -> meaningful tokens (stemmed, synonyms merged, filler removed, typos fixed). */
export function tokens(text: string, fix = true): string[] {
  const out: string[] = [];
  for (let w of words(text)) {
    if (STOP.has(w)) continue;
    if (fix) w = fixTypo(w);
    out.push(toToken(w));
  }
  return out;
}

const QUESTION_WORDS = ['who', 'what', 'where', 'when', 'why', 'how', 'which'];
/** Phrases made only of these words ("what you") must be side by side, or they match almost any question. */
const TIGHT = new Set([...QUESTION_WORDS, 'you', 'your']);

interface Compiled {
  topic: Topic;
  singles: Map<string, number>;
  phrases: { toks: string[]; weight: number; tight: boolean }[];
}

let compiled: Compiled[] | null = null;

export function compile(topics: Topic[]) {
  VOCAB.clear();
  KNOWN.clear();
  for (const t of topics) {
    for (const k of [...t.keys, ...(t.strong ?? []).map((x) => x.split(':')[0])]) for (const w of words(k)) if (!STOP.has(w)) VOCAB.add(w);
  }
  for (const [head, members] of Object.entries(GROUPS)) {
    VOCAB.add(head);
    members.forEach((m) => VOCAB.add(m.replace(/_$/, '')));
  }
  for (const w of VOCAB) KNOWN.add(toToken(w));
  for (const w of [...QUESTION_WORDS, 'you', 'your']) KNOWN.add(w);
  compiled = topics
    .filter((t) => !t.exact)
    .map((topic) => {
      const singles = new Map<string, number>();
      const phrases: Compiled['phrases'] = [];
      for (const entry of topic.strong ?? []) {
        const [w, weight] = entry.split(':');
        for (const tk of tokens(w, false)) singles.set(tk, weight ? Number(weight) : 4);
      }
      for (const key of topic.keys) {
        const tk = tokens(key, false);
        if (tk.length === 1) {
          if (!singles.has(tk[0])) singles.set(tk[0], 1.5);
        } else if (tk.length > 1) phrases.push({ toks: tk, weight: 2 + 1.5 * (tk.length - 1), tight: tk.every((t) => TIGHT.has(t)) });
      }
      return { topic, singles, phrases };
    });
}

/** Where do the phrase words appear, in order and close together (a few filler words in between are fine)? */
function inWindow(phrase: string[], toks: string[], tight = false): number[] | null {
  const span = phrase.length + (tight ? 0 : 1);
  for (let start = 0; start < toks.length; start++) {
    if (toks[start] !== phrase[0]) continue;
    const at = [start];
    let ok = true;
    for (let i = 1; i < phrase.length; i++) {
      let found = -1;
      for (let j = at[at.length - 1] + 1; j < Math.min(toks.length, start + span); j++) {
        if (toks[j] === phrase[i]) {
          found = j;
          break;
        }
      }
      if (found < 0) {
        ok = false;
        break;
      }
      at.push(found);
    }
    if (ok) return at;
  }
  return null;
}

/** Share of the message's meaningful words that the assistant actually knows (0 to 1). */
export function knownRatio(text: string): number {
  const t = tokens(text);
  return t.length ? t.filter((w) => KNOWN.has(w)).length / t.length : 0;
}

export interface Scored {
  topic: Topic;
  score: number;
}

/** Score every topic for a piece of text, best first. */
export function rank(text: string): Scored[] {
  if (!compiled) return [];
  const toks = tokens(text);
  if (!toks.length) return [];
  const have = new Set(toks);
  const asked = QUESTION_WORDS.filter((q) => have.has(q));
  const scored: Scored[] = [];
  const lower = text.toLowerCase();
  for (const c of compiled) {
    if (c.topic.deny?.some((d) => new RegExp(d).test(lower))) continue;
    if (c.topic.maxTokens && toks.length > c.topic.maxTokens) continue;
    // Every match says which message words it explains. Matches are counted best-first, and a match that
    // only repeats words already explained counts for little, so long overlapping keyword lists cannot
    // inflate a topic's score.
    const matches: { weight: number; at: number[] }[] = [];
    for (const [tk, weight] of c.singles) {
      const at = toks.reduce<number[]>((acc, t, i) => (t === tk ? [...acc, i] : acc), []);
      if (at.length) matches.push({ weight, at: [at[0]] });
    }
    for (const p of c.phrases) {
      const at = inWindow(p.toks, toks, p.tight);
      if (at) matches.push({ weight: p.weight, at });
    }
    matches.sort((a, b) => b.weight - a.weight);
    const covered = new Set<number>();
    let score = 0;
    for (const m of matches) {
      const fresh = m.at.filter((i) => !covered.has(i)).length;
      if (!fresh) continue;
      score += m.weight * (fresh / m.at.length);
      m.at.forEach((i) => covered.add(i));
    }
    if (score > 0 && c.topic.on && asked.some((q) => c.topic.on!.includes(q))) score += 1.5;
    if (score > 0) scored.push({ topic: c.topic, score });
  }
  return scored.sort((a, b) => b.score - a.score);
}

/** A short message needs less evidence than a long one. */
export const minScore = (text: string) => (tokens(text).length <= 2 ? 1.5 : 2.5);

/** Split a message into its separate questions ("how much, and where are you?"). */
const ASKING = /\?|\b(?:who|what|whats|where|when|why|how|which|do|does|can|could|is|are|will|would|need|want|wanna|show|give|tell|send|looking|interested|like|please|pls|abeg|any|have)\b/i;
export const clauses = (text: string): string[] => {
  const parts = text.split(/(?<=\?)|[!.;\n]+|,|\band\b|\balso\b|\bplus\b|\bthen\b/i).map((s) => (s ?? '').trim());
  // Only the parts that ask for something count; background remarks ("i saw your flyers") are ignored.
  return parts.filter((s) => tokens(s, false).length > 0 && (parts.length < 2 || ASKING.test(s)));
};
