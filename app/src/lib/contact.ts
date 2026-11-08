/** Single source of truth for how visitors reach Mishael. */

/** General WhatsApp line: floating chat hand-off, contact section, everything except service enquiries. */
export const WHATSAPP_LOCAL = '07086757575';
/** International digits (no "+") that wa.me needs: Nigeria country code 234, leading 0 dropped. */
export const WHATSAPP_INTL = `234${WHATSAPP_LOCAL.replace(/^0/, '')}`;
export const WHATSAPP_DISPLAY = '+234 708 675 7575';

/** Service / integration leads (the four "Advanced Website Integrations" cards) go to this WhatsApp line. */
export const SERVICES_WHATSAPP_INTL = '2348146385394';
export const SERVICES_WHATSAPP_DISPLAY = '+234 814 638 5394';

/** Calling number (voice calls). */
export const PHONE_DISPLAY = '+234 814 265 6848';
export const PHONE_TEL = 'tel:+2348142656848';

export const EMAIL = 'empiredigitalsworldwide@gmail.com';

export const WHATSAPP_PREFILL = "Hello Mishael, I found your portfolio and I'd like to discuss a project.";

const wa = (intl: string, text: string) => `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;

export const whatsappUrl = (text: string = WHATSAPP_PREFILL) => wa(WHATSAPP_INTL, text);
export const servicesWhatsappUrl = (text: string) => wa(SERVICES_WHATSAPP_INTL, text);
