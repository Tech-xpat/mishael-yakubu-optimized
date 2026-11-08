import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, Send, X, ArrowUpRight } from 'lucide-react';
import {
  WA_CHIP,
  WA_PROMPT,
  WELCOME,
  answer,
  handoffUrl,
  type Chip,
  type ChatMessage,
  type KnowledgeContext,
} from '../lib/assistant';
import { allCategories, cachedConfig, fetchConfig, EMPTY_CONFIG } from '../lib/categories';
import { fetchCounts } from '../lib/portfolioApi';
import { scrollToTarget } from '../lib/scrollTo';

const STORE = 'assistant:v1';
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function load(): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(STORE);
    const list = raw ? (JSON.parse(raw) as ChatMessage[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/** Floating assistant: opens a mini chat that answers from the site's knowledge and can hand over to WhatsApp. */
export default function ChatAssistant() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(load);
  const [typing, setTyping] = useState(false);
  const [stream, setStream] = useState<{ id: number; shown: number; total: number } | null>(null);
  const [draft, setDraft] = useState('');
  const timers = useRef<number[]>([]);
  const nextId = useRef(messages.reduce((m, x) => Math.max(m, x.id), 0) + 1);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ctxRef = useRef<KnowledgeContext>({ folders: [] });

  const busy = typing || stream !== null;
  const userTurns = messages.filter((m) => m.role === 'user').length;

  useEffect(() => {
    try {
      sessionStorage.setItem(STORE, JSON.stringify(messages));
    } catch {
      /* ignore */
    }
  }, [messages]);

  useEffect(
    () => () =>
      timers.current.forEach((t) => {
        window.clearTimeout(t);
        window.clearInterval(t);
      }),
    []
  );

  const later = (fn: () => void, ms: number) => {
    const t = window.setTimeout(fn, ms);
    timers.current.push(t);
  };

  // Keep knowledge fresh: the portfolio folders (including ones the admin added) and their counts.
  const refreshKnowledge = useCallback(async () => {
    try {
      const [cfg, counts] = await Promise.all([fetchConfig().catch(() => cachedConfig() ?? EMPTY_CONFIG), fetchCounts().catch(() => ({} as Record<string, number>))]);
      ctxRef.current = {
        folders: allCategories(cfg, Object.keys(counts)).map((c) => ({ name: c.name, count: counts[c.slug] || 0 })),
      };
    } catch {
      /* the built-in folder list is used */
    }
  }, []);

  /** Bot speaks: skeleton "typing" bubble, then the words appear one after another, then the quick replies. */
  const botSay = useCallback((text: string, chips: Chip[]) => {
    const quick = reduceMotion();
    setTyping(true);
    later(() => {
      setTyping(false);
      const id = nextId.current++;
      setMessages((m) => [...m, { id, role: 'bot', text, chips }]);
      if (quick) return;
      const total = text.split(/(\s+)/).length;
      setStream({ id, shown: 0, total });
      const step = Math.max(2, Math.ceil(total / 80));
      const iv = window.setInterval(() => {
        setStream((s) => {
          if (!s || s.id !== id) return s;
          const shown = s.shown + step;
          if (shown >= s.total) {
            window.clearInterval(iv);
            return null;
          }
          return { ...s, shown };
        });
      }, 32);
      timers.current.push(iv);
    }, quick ? 120 : Math.min(450 + text.length * 3, 1100));
  }, []);

  // First open: greet.
  useEffect(() => {
    if (!open) return;
    refreshKnowledge();
    inputRef.current?.focus({ preventScroll: true });
    if (messages.length === 0) botSay(WELCOME.text, WELCOME.chips);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useLayoutEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing, stream, open]);

  const send = (raw: string) => {
    const text = raw.trim().slice(0, 400);
    if (!text || busy) return;
    const turn = userTurns + 1;
    setDraft('');
    setMessages((m) => [
      ...m.map((x) => (x.chips ? { ...x, chips: undefined } : x)),
      { id: nextId.current++, role: 'user', text },
    ]);
    const reply = answer(text, ctxRef.current);
    const hasWa = reply.chips.some((c) => c.kind === 'whatsapp');
    // Ask about WhatsApp once the chat has some history, or when the topic is a project enquiry.
    const ask = !hasWa && (turn === 2 || reply.offerWhatsApp);
    botSay(ask ? `${reply.text}\n\n${WA_PROMPT}` : reply.text, ask ? [WA_CHIP, ...reply.chips] : reply.chips);
  };

  const onChip = (chip: Chip) => {
    if (chip.kind === 'ask') return send(chip.label);
    if (chip.kind === 'whatsapp') return openWhatsApp();
    // portfolio
    if (pathname === '/') scrollToTarget('#portfolio');
    else navigate('/', { state: { scrollTo: '#portfolio' } });
    if (window.matchMedia('(max-width: 639px)').matches) setOpen(false);
  };

  const openWhatsApp = () => {
    const url = handoffUrl(messages.filter((m) => m.text));
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (pathname.startsWith('/greatness')) return null;

  const lastBotId = [...messages].reverse().find((m) => m.role === 'bot')?.id;

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="Chat with Mishael's Assistant"
          className="assistant-in fixed left-3 right-3 z-[60] flex flex-col overflow-hidden rounded-2xl border border-white/20 bg-black text-white sm:left-auto sm:right-6 sm:w-[390px]"
          style={{
            bottom: 'calc(max(1rem, env(safe-area-inset-bottom)) + 4.5rem)',
            height: 'min(560px, calc(100dvh - 8.5rem))',
            boxShadow: '6px 6px 0 0 rgb(var(--key-shadow))',
          }}
        >
          {/* header */}
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white font-display text-lg font-bold text-black">
              M
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-black bg-[#25D366]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-body text-sm font-semibold">Mishael's Assistant</p>
              <p className="font-body text-xs text-white/60">Always online</p>
            </div>
            <button
              type="button"
              data-no-press
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* messages */}
          <div
            ref={listRef}
            data-lenis-prevent
            className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4"
            aria-live="polite"
          >
            {messages.map((m) => {
              const streaming = stream && stream.id === m.id ? stream : null;
              const parts = streaming ? m.text.split(/(\s+)/).slice(0, streaming.shown).join('') : m.text;
              const showChips = !streaming && m.id === lastBotId && m.chips && m.chips.length > 0 && !busy;
              return (
                <div key={m.id} className={`msg-in flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[88%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 font-body text-sm leading-relaxed ${
                      m.role === 'user' ? 'rounded-br-sm bg-white text-black' : 'rounded-bl-sm bg-white/10 text-white'
                    }`}
                  >
                    {parts}
                  </div>
                  {showChips && (
                    <div className="msg-in mt-2 flex max-w-[92%] flex-wrap gap-2">
                      {m.chips!.map((c) => (
                        <button
                          key={c.label}
                          type="button"
                          data-no-press
                          onClick={() => onChip(c)}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-body text-xs font-medium transition-colors ${
                            c.kind === 'whatsapp'
                              ? 'border-[#25D366] bg-[#25D366] text-[#04210f] hover:brightness-110'
                              : 'border-white/25 text-white hover:bg-white/10'
                          }`}
                        >
                          {c.kind === 'whatsapp' && <MessageCircle size={13} fill="currentColor" />}
                          {c.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {typing && (
              <div className="msg-in flex items-start" aria-label="Assistant is typing">
                <div className="w-44 space-y-2 rounded-2xl rounded-bl-sm bg-white/10 px-4 py-3">
                  <div className="skeleton h-2.5 w-full rounded" />
                  <div className="skeleton h-2.5 w-2/3 rounded" />
                </div>
              </div>
            )}
          </div>

          {/* WhatsApp hint */}
          {userTurns >= 1 && (
            <button
              type="button"
              onClick={openWhatsApp}
              className="mx-3 mb-2 flex items-center justify-between gap-2 rounded-xl border border-[#25D366]/50 bg-[#25D366]/10 px-3 py-2 text-left font-body text-xs text-white"
            >
              <span>Prefer WhatsApp? Continue this chat with Mishael there.</span>
              <ArrowUpRight size={14} className="shrink-0" />
            </button>
          )}

          {/* input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
            className="flex items-center gap-2 border-t border-white/10 p-3"
          >
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask me anything about Mishael…"
              maxLength={400}
              autoComplete="off"
              enterKeyHint="send"
              className="min-w-0 flex-1 rounded-full border border-white/20 bg-transparent px-4 py-2.5 font-body text-base text-white outline-none placeholder:text-white/40 focus:border-white/50 sm:text-sm"
            />
            <button
              type="submit"
              data-no-press
              disabled={!draft.trim() || busy}
              aria-label="Send"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black transition-opacity disabled:opacity-40"
            >
              <Send size={17} />
            </button>
          </form>
        </div>
      )}

      {/* launcher */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close chat' : "Chat with Mishael's Assistant"}
        aria-expanded={open}
        className="group fixed right-4 z-[61] flex items-center sm:right-6"
        style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        {!open && (
          <span className="pointer-events-none mr-3 hidden translate-x-2 whitespace-nowrap rounded-full bg-white px-4 py-2 text-xs font-medium tracking-wide text-black opacity-0 shadow-lg transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 sm:block">
            Ask Mishael's Assistant
          </span>
        )}
        <span
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white"
          style={{ boxShadow: '3px 3px 0 0 rgb(var(--key-shadow))' }}
        >
          {!open && <span className="whatsapp-ping absolute inset-0 rounded-full bg-[#25D366]" aria-hidden="true" />}
          {open ? (
            <X size={26} strokeWidth={2.4} className="relative" />
          ) : (
            <MessageCircle size={28} strokeWidth={2.2} className="relative" fill="currentColor" />
          )}
        </span>
      </button>
    </>
  );
}
