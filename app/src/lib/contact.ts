/** Single source of truth for how visitors reach Mishael. */

/** Local format, as written on cards and shown on the site. */
export const WHATSAPP_LOCAL = '07086757575';
/** International digits (no "+") that wa.me needs: Nigeria country code 234, leading 0 dropped. */
export const WHATSAPP_INTL = `234${WHATSAPP_LOCAL.replace(/^0/, '')}`;
export const WHATSAPP_DISPLAY = '+234 708 675 7575';

export const WHATSAPP_PREFILL = "Hello Mishael, I found your portfolio and I'd like to discuss a project.";

export const whatsappUrl = (text: string = WHATSAPP_PREFILL) =>
  `https://wa.me/${WHATSAPP_INTL}?text=${encodeURIComponent(text)}`;
