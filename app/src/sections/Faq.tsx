import { useState } from 'react';
import { ArrowUpRight, MessageCircle, Plus } from 'lucide-react';
import { CARE_DISPLAY, WHATSAPP_DISPLAY, whatsappUrl } from '../lib/contact';

const FAQ = [
  { q: 'How do I start a project?', a: 'Tap any "Get this package" button, or message me on WhatsApp. I reply there and we take it from the first message.' },
  { q: 'How fast do you deliver?', a: 'Designs are delivered within 24 hours. Full projects are also aimed at 24 hours, depending on the scope.' },
  { q: 'Where are you based?', a: 'Ughelli, Delta State, Nigeria. I work with clients anywhere, mostly over WhatsApp.' },
  { q: 'What is in each package?', a: 'There are five levels, from Starter to Super, and each one includes more than the one before. The full lists are in the Services section above.' },
  { q: 'Can you build something custom, like a bot or a web app?', a: 'Yes. Websites, advanced integrations, WhatsApp bots and AI automation are all part of the work. Tell me what you have in mind on WhatsApp.' },
  { q: 'Who do I contact for help after delivery?', a: `Customer care is on ${CARE_DISPLAY}. For chats and new enquiries, use ${WHATSAPP_DISPLAY}.` },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative bg-black px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1fr_1.5fr] md:gap-16">
        <div>
          <p className="mono-label mb-4">04 / Questions</p>
          <h2 className="font-display text-4xl font-bold leading-[1.05] text-white sm:text-5xl">Asked often.</h2>
          <p className="mt-4 max-w-xs font-body text-sm leading-relaxed text-white/60">Not here? Ask directly. You will get a real reply.</p>
          <a
            href={whatsappUrl("Hello Mishael, I have a question before I start a project.")}
            target="_blank"
            rel="noopener noreferrer"
            className="key-btn key-btn-wa group mt-6 inline-flex items-center gap-2.5 px-5 py-3 font-body text-xs font-semibold uppercase tracking-wider"
          >
            <MessageCircle size={16} fill="currentColor" /> Ask your question <ArrowUpRight size={15} />
          </a>
        </div>

        <ul className="divide-y divide-white/10 border-y border-white/10">
          {FAQ.map((f, i) => {
            const isOpen = open === i;
            return (
              <li key={f.q}>
                <button
                  data-no-press
                  aria-expanded={isOpen}
                  aria-controls={`faq-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center gap-4 py-5 text-left"
                >
                  <span className="mono-label w-7 shrink-0">0{i + 1}</span>
                  <span className="flex-1 font-display text-lg font-semibold text-white sm:text-xl">{f.q}</span>
                  <Plus size={20} className={`shrink-0 text-white/70 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} />
                </button>
                <div id={`faq-${i}`} role="region" className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <p className="pb-5 pl-11 pr-8 font-body text-sm leading-relaxed text-white/65 sm:text-base">{f.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
