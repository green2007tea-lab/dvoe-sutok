// Contacts: the real Almaty time under a large sun (by day) or moon (by
// night). The body leans a little with the cursor anywhere on the screen.
// The ticking colon, live dot, turning rays and twinkling stars are CSS.
import gsap from 'gsap';
import { SUNRISE, SUNSET } from './daycycle';

const HOURS = 24;
const LEAN_X = 16; // px at the screen edge
const LEAN_Y = 12;
const LEAN_TURN = 3; // deg
const LEAN_S = 1.4; // slow and soft

const pad = (n: number): string => String(n).padStart(2, '0');

export interface NowClock {
  /** Real Almaty time as a fractional hour. */
  setReal(hour: number): void;
  /** Listen to the cursor only while the block is on screen. */
  setFollow(active: boolean): void;
}

export function initNowClock(options: { follow: boolean }): NowClock | null {
  const root = document.querySelector<HTMLElement>('[data-now]');
  const body = root?.querySelector<HTMLElement>('[data-now-body]');
  const hh = root?.querySelector<HTMLElement>('[data-now-hh]');
  const mm = root?.querySelector<HTMLElement>('[data-now-mm]');
  if (!root || !body || !hh || !mm) return null;

  let onMove: ((event: PointerEvent) => void) | null = null;
  if (options.follow) {
    const xTo = gsap.quickTo(body, 'x', { duration: LEAN_S, ease: 'power3.out' });
    const yTo = gsap.quickTo(body, 'y', { duration: LEAN_S, ease: 'power3.out' });
    const turnTo = gsap.quickTo(body, 'rotation', { duration: LEAN_S, ease: 'power3.out' });
    onMove = (event) => {
      const nx = event.clientX / window.innerWidth - 0.5;
      const ny = event.clientY / window.innerHeight - 0.5;
      xTo(nx * 2 * LEAN_X);
      yTo(ny * 2 * LEAN_Y);
      turnTo(nx * 2 * LEAN_TURN);
    };
  }
  let following = false;

  return {
    setReal(hour) {
      const real = ((hour % HOURS) + HOURS) % HOURS;
      const minutes = Math.floor(real * 60) % (HOURS * 60);
      const nextH = pad(Math.floor(minutes / 60));
      const nextM = pad(minutes % 60);
      if (hh.textContent !== nextH) hh.textContent = nextH;
      if (mm.textContent !== nextM) mm.textContent = nextM;
      root.classList.toggle('is-night', real < SUNRISE || real > SUNSET);
    },
    setFollow(active) {
      if (!onMove || active === following) return;
      following = active;
      if (active) window.addEventListener('pointermove', onMove);
      else window.removeEventListener('pointermove', onMove);
    },
  };
}
