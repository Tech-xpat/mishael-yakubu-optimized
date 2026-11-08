import { MessageCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { whatsappUrl } from '../lib/contact';

/** Floating "Chat on WhatsApp" button, shown on every public page. */
export default function WhatsAppButton() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/greatness')) return null;

  return (
    <a
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Mishael on WhatsApp"
      className="group fixed right-4 z-[35] flex items-center sm:right-6"
      style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <span className="pointer-events-none mr-3 hidden sm:block whitespace-nowrap rounded-full bg-white px-4 py-2 text-xs font-medium tracking-wide text-black opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2">
        Chat on WhatsApp
      </span>
      <span
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white"
        style={{ boxShadow: '3px 3px 0 0 rgb(var(--key-shadow))' }}
      >
        <span className="whatsapp-ping absolute inset-0 rounded-full bg-[#25D366]" aria-hidden="true" />
        <MessageCircle size={28} strokeWidth={2.2} className="relative" fill="currentColor" />
      </span>
    </a>
  );
}
