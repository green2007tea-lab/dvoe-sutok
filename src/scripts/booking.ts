// Client-side, no animation: greeting by Almaty time and putting the chosen
// dates into every WhatsApp link. Nothing is sent anywhere but WhatsApp.
import { buildWaText, waHref, type WaStrings } from '../lib/wa';

const ALMATY_TZ = 'Asia/Almaty';

type DayPart = 'morning' | 'day' | 'evening' | 'night';

const almatyHour = (): number =>
  Number(
    new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: ALMATY_TZ }).format(
      new Date(),
    ),
  );

const dayPart = (hour: number): DayPart => {
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'day';
  if (hour >= 17 && hour < 23) return 'evening';
  return 'night';
};

function setGreeting(): void {
  const el = document.querySelector<HTMLElement>('[data-greeting]');
  const text = el?.dataset[dayPart(almatyHour())];
  if (el && text) el.textContent = text;
}

/** Today in Almaty as YYYY-MM-DD (en-CA formats dates that way). */
const almatyToday = (): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone: ALMATY_TZ }).format(new Date());

/** "2026-10-12" → local Date without a timezone shift. */
const parseIsoDate = (iso: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
};

interface PageStrings {
  readonly wa: WaStrings;
  readonly months: readonly string[];
}

function readStrings(): PageStrings | null {
  const node = document.getElementById('wa-strings');
  if (!node?.textContent) return null;
  try {
    return JSON.parse(node.textContent) as PageStrings;
  } catch {
    return null;
  }
}

function datesText(checkIn: string, checkOut: string, months: readonly string[]): string {
  const format = (date: Date): string => `${date.getDate()} ${months[date.getMonth()]}`;
  const from = parseIsoDate(checkIn);
  const to = parseIsoDate(checkOut);
  if (!from) return '';
  if (!to || to <= from) return format(from);
  return `${format(from)} — ${format(to)}`;
}

function initDatesForm(): void {
  const form = document.querySelector<HTMLFormElement>('[data-dates-form]');
  const strings = readStrings();
  if (!form || !strings) return;

  const checkIn = form.elements.namedItem('checkIn') as HTMLInputElement;
  const checkOut = form.elements.namedItem('checkOut') as HTMLInputElement;
  const guests = form.elements.namedItem('guests') as HTMLSelectElement;

  checkIn.min = almatyToday();
  checkOut.min = almatyToday();

  const update = (): void => {
    if (checkIn.value) checkOut.min = checkIn.value;
    const dates = datesText(checkIn.value, checkOut.value, strings.months);
    document.querySelectorAll<HTMLAnchorElement>('[data-wa]').forEach((link) => {
      const text = buildWaText(strings.wa, {
        apartment: link.dataset.waApartment || undefined,
        dates: dates || undefined,
        guests: guests.value || undefined,
      });
      link.href = waHref(text);
    });
  };

  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('submit', (event) => event.preventDefault());
}

setGreeting();
initDatesForm();
