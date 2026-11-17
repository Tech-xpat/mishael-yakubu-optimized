import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Bot, MessageCircle, RotateCcw, Send } from 'lucide-react';
import { answer, handoffUrl, WELCOME, type ChatMessage, type Chip } from '../lib/assistant';
import { servicesWhatsappUrl } from '../lib/contact';
import { scrollToTarget } from '../lib/scrollTo';
import { useInView } from '../lib/useInView';

/** An example conversation: a business bot taking an order. Shown as a demo, not a real client. */
const NODES = ['Message in', 'Understand', 'Reply', 'Log order', 'Notify owner'];
interface Step {
  from: 'user' | 'bot';
  text: string;
  node: number;
  logs: string[];
}
const SCRIPT: Step[] = [
  { from: 'user', text: 'Hi, do you deliver to Warri?', node: 0, logs: ['message.received  channel=whatsapp'] },
  { from: 'bot', text: 'Hello! Yes, we deliver to Warri the same day. What would you like to order?', node: 1, logs: ['intent=delivery_query', 'reply.sent  1.1s'] },
  { from: 'user', text: '2 bags of rice please', node: 0, logs: ['message.received'] },
  { from: 'bot', text: 'Noted: 2 bags of rice. Will you pay by transfer or card?', node: 2, logs: ['order.draft  items=1'] },
  { from: 'user', text: 'Transfer', node: 0, logs: ['message.received'] },
  { from: 'bot', text: 'Order #1042 confirmed. Payment details are on the way and the owner has been told.', node: 4, logs: ['order.created  #1042', 'payment.instructions.sent', 'owner.notified  whatsapp'] },
];

const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type Mode = 'example' | 'try';
interface Line { id: number; role: 'user' | 'bot'; text: string; chips?: Chip[] }

export default function LiveDemo() {
  const [mode, setMode] = useState<Mode>('example');
  const [rootRef, inView] = useInView<HTMLElement>(0.3);
  const listRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  // example playback
  const [shown, setShown] = useState<number[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [node, setNode] = useState(-1);
  const [typing, setTyping] = useState(false);
  const [finished, setFinished] = useState(false);

  // live assistant
  const nextId = useRef(2);
  const [lines, setLines] = useState<Line[]>([{ id: 1, role: 'bot', text: WELCOME.text, chips: WELCOME.chips }]);
  const [draft, setDraft] = useState('');

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  const play = useCallback(() => {
    clear();
    setShown([]);
    setLogs([]);
    setNode(-1);
    setTyping(false);
    setFinished(false);
    if (reduceMotion()) {
      setShown(SCRIPT.map((_, i) => i));
      setLogs(SCRIPT.flatMap((s) => s.logs));
      setNode(4);
      setFinished(true);
      return;
    }
    let t = 500;
    SCRIPT.forEach((s, i) => {
      if (s.from === 'bot') {
        at(t, () => setTyping(true));
        t += 1000;
      } else t += 500;
      at(t, () => {
        setTyping(false);
        setShown((x) => [...x, i]);
        setNode(s.node);
        setLogs((l) => [...l, ...s.logs]);
      });
      t += 900;
    });
    at(t, () => setFinished(true));
  }, []);

  useEffect(() => {
    if (inView && mode === 'example') play();
    return clear;
  }, [inView, mode, play]);

  // keep the newest message visible inside the phone (never scrolls the page)
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [shown, typing, lines]);

  const ask = (q: string) => {
    const text = q.trim();
    if (!text || typing) return;
    const uid = nextId.current++;
    setLines((l) => [...l, { id: uid, role: 'user', text }]);
    setDraft('');
    setTyping(true);
    at(reduceMotion() ? 100 : 800, () => {
      const r = answer(text, { folders: [] });
      setTyping(false);
      setLines((l) => [...l, { id: nextId.current++, role: 'bot', text: r.text, chips: r.chips }]);
    });
  };

  const onChip = (c: Chip) => {
    if (c.kind === 'ask') ask(c.label);
    else if (c.kind === 'portfolio') scrollToTarget('#portfolio');
    else {
      const msgs: ChatMessage[] = lines.map((l) => ({ id: l.id, role: l.role, text: l.text }));
      window.open(handoffUrl(msgs), '_blank', 'noopener,noreferrer');
    }
  };

  const switchTo = (m: Mode) => {
    if (m === mode) return;
    clear();
    setTyping(false);
    setMode(m);
  };

  return (
    <section ref={rootRef} id="live" className="relative bg-black px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1fr_auto] md:gap-16 lg:gap-24">
        <div>
          <p className="mono-label mb-4 flex items-center gap-3"><span className="signal-dot" aria-hidden="true" />01 / Live system</p>
          <h2 className="font-display text-4xl font-bold leading-[1.05] text-white sm:text-5xl md:text-6xl">
            Automation you can watch work.
          </h2>
          <p className="mt-5 max-w-xl font-body text-sm leading-relaxed text-white/65 sm:text-base">
            I build WhatsApp bots, assistants and workflows that answer customers, take orders and tell you when a human is needed. Watch an example run, or ask my own assistant something.
          </p>

          <div role="tablist" aria-label="Demo" className="mt-7 inline-flex border border-white/20 p-1">
            {([['example', 'Example bot'], ['try', 'Try my assistant']] as const).map(([m, label]) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                onClick={() => switchTo(m)}
                className={`px-4 py-2.5 font-body text-xs font-semibold uppercase tracking-wider transition-colors ${mode === m ? 'bg-white text-black' : 'text-white/70 hover:text-white'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* pipeline */}
          <ol className="mt-8 flex flex-wrap items-center gap-y-3" aria-label="How a message flows through the system">
            {NODES.map((n, i) => (
              <li key={n} className="flex items-center">
                <span
                  className={`mono-label border px-2.5 py-1.5 transition-all duration-300 ${mode === 'example' && node === i ? 'border-transparent bg-white !text-black' : mode === 'example' && node > i ? 'border-white/40 !text-white/80' : 'border-white/15'}`}
                  style={mode === 'example' && node === i ? { boxShadow: '3px 3px 0 0 rgb(var(--key-shadow))' } : undefined}
                >
                  {n}
                </span>
                {i < NODES.length - 1 && <span className="mx-1.5 h-px w-3 bg-white/25 sm:w-5" aria-hidden="true" />}
              </li>
            ))}
          </ol>

          {/* log */}
          <div className="mt-6 max-w-xl border border-white/10 bg-white/[0.03] p-4" aria-live="off">
            <p className="mono-label mb-3">System log</p>
            <div className="h-36 overflow-hidden font-mono text-[11px] leading-6 text-white/70 sm:text-xs" style={{ fontFamily: 'ui-monospace, Menlo, Consolas, monospace' }}>
              {mode === 'example' ? (
                logs.length ? logs.slice(-6).map((l, i) => (
                  <p key={`${logs.length}-${i}`} className="log-line truncate"><span className="text-white/35">&gt; </span>{l}</p>
                )) : <p className="text-white/35">&gt; waiting for first message…</p>
              ) : (
                <>
                  <p className="text-white/35">&gt; assistant.mode  live</p>
                  <p className="text-white/35">&gt; knowledge  this website</p>
                  <p className="text-white/35">&gt; messages  {lines.filter((l) => l.role === 'user').length}</p>
                  <p className="text-white/35">&gt; handoff  whatsapp ready</p>
                </>
              )}
            </div>
          </div>

          <a
            href={servicesWhatsappUrl("Hello Mishael, I'd like a WhatsApp bot or automation built for my business.")}
            target="_blank"
            rel="noopener noreferrer"
            className="key-btn key-btn-wa group mt-8 inline-flex w-full items-center justify-center gap-2.5 px-6 py-3.5 font-body text-sm font-semibold uppercase tracking-wider sm:w-auto"
          >
            <MessageCircle size={18} fill="currentColor" />
            <span>Build one for my business</span>
            <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
          </a>
        </div>

        {/* phone */}
        <div className="mx-auto w-full max-w-[300px]">
          <div className="rounded-[2.4rem] border-[9px] border-neutral-800 bg-[#0b141a] shadow-[8px_8px_0_0_rgb(var(--key-shadow))]">
            <div className="flex items-center gap-3 rounded-t-[1.7rem] bg-[#202c33] px-4 py-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2a3942] text-[#e9edef]"><Bot size={18} /></span>
              <span className="leading-tight">
                <span className="block font-body text-sm font-semibold text-[#e9edef]">{mode === 'example' ? 'Example Store Bot' : "Mishael's Assistant"}</span>
                <span className="block font-body text-[11px] text-[#8696a0]">{typing ? 'typing…' : 'online'}</span>
              </span>
              {mode === 'example' && finished && (
                <button onClick={play} aria-label="Replay the example" className="ml-auto text-[#8696a0] hover:text-[#e9edef]"><RotateCcw size={16} /></button>
              )}
            </div>

            <div ref={listRef} data-lenis-prevent className="h-[380px] space-y-2 overflow-y-auto overscroll-contain px-3 py-3 sm:h-[420px]">
              {mode === 'example'
                ? shown.map((i) => <Bubble key={i} role={SCRIPT[i].from} text={SCRIPT[i].text} />)
                : lines.map((l) => (
                    <div key={l.id}>
                      <Bubble role={l.role} text={l.text} />
                      {l.chips && l.role === 'bot' && l.id === lines[lines.length - 1].id && !typing && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {l.chips.map((c) => (
                            <button key={c.label} data-no-press onClick={() => onChip(c)} className="rounded-full border border-[#2a3942] px-3 py-1.5 text-left font-body text-[11px] text-[#e9edef] hover:bg-[#202c33]">
                              {c.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              {typing && (
                <div className="flex w-14 justify-center gap-1 rounded-lg bg-[#202c33] px-3 py-3" aria-label="typing">
                  {[0, 1, 2].map((d) => <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8696a0]" style={{ animationDelay: `${d * 120}ms` }} />)}
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); ask(draft); }}
              className="flex items-center gap-2 rounded-b-[1.7rem] bg-[#202c33] px-3 py-2.5"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={mode === 'example'}
                placeholder={mode === 'example' ? 'Example conversation' : 'Ask about packages, prices…'}
                aria-label="Message"
                className="min-w-0 flex-1 rounded-full bg-[#2a3942] px-4 py-2 font-body text-[16px] text-[#e9edef] placeholder-[#8696a0] outline-none disabled:opacity-60 sm:text-sm"
              />
              <button type="submit" data-no-press disabled={mode === 'example' || !draft.trim()} aria-label="Send" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00a884] text-[#0b141a] disabled:opacity-40">
                <Send size={16} />
              </button>
            </form>
          </div>
          <p className="mono-label mt-5 text-center">{mode === 'example' ? 'Example flow, not a real customer' : 'Live. Answers from this site'}</p>
        </div>
      </div>
    </section>
  );
}

function Bubble({ role, text }: { role: 'user' | 'bot'; text: string }) {
  return (
    <div className={`log-line flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <p className={`max-w-[85%] whitespace-pre-line rounded-lg px-3 py-2 font-body text-[13px] leading-snug text-[#e9edef] ${role === 'user' ? 'bg-[#005c4b]' : 'bg-[#202c33]'}`}>{text}</p>
    </div>
  );
}
