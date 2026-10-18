// The day model behind the whole page: an Almaty hour (0..24) becomes sky
// colours, sun/moon position, star strength and the text theme.
// Scroll moves the hour forward by exactly 24 h from "now" ("двое суток").

export type Rgb = readonly [number, number, number];
export type Phase = 'morning' | 'day' | 'evening' | 'night';

interface Key {
  readonly h: number;
  readonly top: Rgb;
  readonly horizon: Rgb;
  readonly glow: Rgb; // sun/moon light colour
  readonly stars: number;
}

const hex = (value: string): Rgb => {
  const n = parseInt(value.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

// Keyframes around the clock. The first and last share colours so 0 and 24 meet.
const KEYS: readonly Key[] = [
  { h: 0, top: hex('#061722'), horizon: hex('#123845'), glow: hex('#cfe3ff'), stars: 1 },
  { h: 4.5, top: hex('#0a2131'), horizon: hex('#1d4250'), glow: hex('#cfe3ff'), stars: 0.9 },
  { h: 5.8, top: hex('#2c4a70'), horizon: hex('#f4a487'), glow: hex('#ffc59a'), stars: 0.25 },
  { h: 7.2, top: hex('#6cb6e2'), horizon: hex('#ffdcb0'), glow: hex('#ffe3a6'), stars: 0 },
  { h: 12, top: hex('#3f9fdb'), horizon: hex('#c9ecfb'), glow: hex('#fff6d8'), stars: 0 },
  { h: 16.5, top: hex('#4a9cd3'), horizon: hex('#ffe6b4'), glow: hex('#ffe9b0'), stars: 0 },
  { h: 18.8, top: hex('#3a5e93'), horizon: hex('#ff9d55'), glow: hex('#ffb35c'), stars: 0 },
  { h: 20.2, top: hex('#1d2b56'), horizon: hex('#e5566a'), glow: hex('#ff8a6a'), stars: 0.2 },
  { h: 21.6, top: hex('#0b1d2e'), horizon: hex('#1f4152'), glow: hex('#cfe3ff'), stars: 0.85 },
  { h: 24, top: hex('#061722'), horizon: hex('#123845'), glow: hex('#cfe3ff'), stars: 1 },
];

export const SUNRISE = 6;
export const SUNSET = 20.5;
// Switch text to light while the sky is still mid-blue: keeps contrast at dusk and dawn.
const DAWN_LIGHT = 6.9;
const DUSK_DARK = 18.4;
const THEME_MARGIN = 0.15; // h: about 0.6% of the page either side of a switch

const smooth = (t: number): number => t * t * (3 - 2 * t);
const mix = (a: Rgb, b: Rgb, t: number): Rgb => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

export const wrapHour = (hour: number): number => ((hour % 24) + 24) % 24;

export interface Sky {
  readonly top: Rgb;
  readonly horizon: Rgb;
  readonly glow: Rgb;
  readonly stars: number;
  /** Sun (or moon at night) position in 0..1 viewport space, y up. */
  readonly body: readonly [number, number];
  /** 1 = sun is up, 0 = moon is up. */
  readonly isSun: number;
  readonly phase: Phase;
  /** Sky is dark enough that text on it must turn light. */
  readonly isDark: boolean;
}

/** Height of the arc ends: below the foothills, so the sun rises and the moon sets behind the Alatau. */
export const ARC_LOW = -0.08;
export const ARC_PEAK = 0.84;
// Below 1 the body climbs clear of the ridges quickly, then lingers high.
const ARC_SHAPE = 0.7;

/** Position on the arc of the day: x left→right, y a soft arch from behind the mountains. */
const arc = (t: number): readonly [number, number] => [
  0.08 + t * 0.84,
  ARC_LOW + Math.sin(t * Math.PI) ** ARC_SHAPE * (ARC_PEAK - ARC_LOW),
];

export function skyAt(rawHour: number): Sky {
  const hour = wrapHour(rawHour);
  const index = KEYS.findIndex((key) => key.h > hour);
  const b = KEYS[Math.max(1, index)];
  const a = KEYS[Math.max(0, index - 1)];
  const t = smooth((hour - a.h) / (b.h - a.h || 1));

  const isSunUp = hour >= SUNRISE && hour <= SUNSET;
  const dayT = (hour - SUNRISE) / (SUNSET - SUNRISE);
  const nightLength = 24 - (SUNSET - SUNRISE);
  const nightT = wrapHour(hour - SUNSET) / nightLength;

  return {
    top: mix(a.top, b.top, t),
    horizon: mix(a.horizon, b.horizon, t),
    glow: mix(a.glow, b.glow, t),
    stars: a.stars + (b.stars - a.stars) * t,
    body: arc(isSunUp ? dayT : nightT),
    isSun: isSunUp ? 1 : 0,
    phase: phaseOf(hour),
    isDark: hour < DAWN_LIGHT || hour > DUSK_DARK,
  };
}

/**
 * Text theme with a margin around both switch points: a scroll that settles
 * right at the threshold must not flicker the headings between dark and light.
 */
export function darkAfter(rawHour: number, wasDark: boolean | null): boolean {
  const hour = wrapHour(rawHour);
  const pad = wasDark === null ? 0 : wasDark ? -THEME_MARGIN : THEME_MARGIN;
  return hour < DAWN_LIGHT + pad || hour > DUSK_DARK - pad;
}

export function phaseOf(hour: number): Phase {
  const h = wrapHour(hour);
  if (h >= 5 && h < 11) return 'morning';
  if (h >= 11 && h < 17) return 'day';
  if (h >= 17 && h < 23) return 'evening';
  return 'night';
}

/** Current Almaty time as a fractional hour. */
export function almatyHourNow(): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
    timeZone: 'Asia/Almaty',
  }).formatToParts(new Date());
  const get = (type: string): number => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return get('hour') + get('minute') / 60;
}

export const formatClock = (hour: number): string => {
  const total = Math.floor(wrapHour(hour) * 60);
  const hh = String(Math.floor(total / 60)).padStart(2, '0');
  const mm = String(total % 60).padStart(2, '0');
  return `${hh}:${mm}`;
};
