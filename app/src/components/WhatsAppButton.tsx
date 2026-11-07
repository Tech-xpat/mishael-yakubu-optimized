import { MessageCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const WHATSAPP_NUMBER = '2347086757575';
const PREFILL = "Hello Mishael, I found your portfolio and I'd like to discuss a project.";

/** Floating "Chat on WhatsApp" button, shown on every public page. */
export default function WhatsAppButton() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/greatness')) return null;

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(PREFILL)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Mishael on WhatsApp"
      className="group fixed bottom-6 right-6 z-[35] flex items-center"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <span className="pointer-events-none mr-3 hidden sm:block whitespace-nowrap rounded-full bg-white px-4 py-2 text-xs font-medium tracking-wide text-black opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2">
        Chat on WhatsApp
      </span>
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_30px_rgba(37,211,102,0.35)]">
        <span className="whatsapp-ping absolute inset-0 rounded-full bg-[#25D366]" aria-hidden="true" />
        <MessageCircle size={28} strokeWidth={2.2} className="relative" fill="currentColor" />
      </span>
    </a>
  );
}
