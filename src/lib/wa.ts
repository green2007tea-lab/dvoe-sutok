// Builds the prefilled WhatsApp message. Used at build time (links in HTML)
// and in the browser (dates from the form). No booking system: text only.
import { PHONE } from '../data/site';

export interface WaStrings {
  readonly hello: string;
  readonly want: string;
  readonly apartment: string;
  readonly dates: string;
  readonly guests: string;
}

export interface WaParts {
  readonly apartment?: string;
  readonly dates?: string;
  readonly guests?: string;
}

export const buildWaText = (s: WaStrings, parts: WaParts = {}): string => {
  const lines = [
    s.hello,
    parts.apartment ? `${s.apartment}${parts.apartment}` : s.want,
    parts.dates ? `${s.dates}${parts.dates}` : '',
    parts.guests ? `${s.guests}${parts.guests}` : '',
  ];
  return lines.filter(Boolean).join('\n');
};

export const waHref = (text: string): string =>
  `https://wa.me/${PHONE.digits}?text=${encodeURIComponent(text)}`;
