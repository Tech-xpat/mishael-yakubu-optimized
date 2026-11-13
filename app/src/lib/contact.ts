/** Single source of truth for how visitors reach Mishael. */

/** Calling number; also the WhatsApp line for chats and service enquiries. */
export const PHONE_DISPLAY = '+234 814 265 6848';
export const PHONE_TEL = 'tel:+2348142656848';

/** WhatsApp for chats (floating hand-off, contact section) and for service / package enquiries. */
export const WHATSAPP_LOCAL = '08142656848';
/** International digits (no "+") that wa.me needs: Nigeria country code 234, leading 0 dropped. */
export const WHATSAPP_INTL = `234${WHATSAPP_LOCAL.replace(/^0/, '')}`;
export const WHATSAPP_DISPLAY = PHONE_DISPLAY;
export const SERVICES_WHATSAPP_INTL = WHATSAPP_INTL;
export const SERVICES_WHATSAPP_DISPLAY = WHATSAPP_DISPLAY;

/** Customer care line. */
export const CARE_LOCAL = '07086757575';
export const CARE_DISPLAY = '+234 708 675 7575';
export const CARE_TEL = 'tel:+2347086757575';
export const CARE_WHATSAPP_INTL = `234${CARE_LOCAL.replace(/^0/, '')}`;

export const EMAIL = 'empiredigitalsworldwide@gmail.com';

export const WHATSAPP_PREFILL = "Hello Mishael, I found your portfolio and I'd like to discuss a project.";

const wa = (intl: string, text: string) => `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;

export const whatsappUrl = (text: string = WHATSAPP_PREFILL) => wa(WHATSAPP_INTL, text);
export const servicesWhatsappUrl = (text: string) => wa(SERVICES_WHATSAPP_INTL, text);
