// Everything that answers the visitor's hand: magnetic buttons, the photo fan
// leaning toward the cursor, apartment photo switching, the reviews slider,
// the key turning in the lock, numbers that grow to their value, and the
// small suns that stand on the arcs of the day.
import gsap from 'gsap';

const MAGNET_STRENGTH = 0.28;
const MAGNET_LABEL = 0.12;
const KEY_HOLD_S = 1.2; // the door stays open a moment after the click
const REVIEW_OUT = 0.16;
const REVIEW_IN = 0.32;
const ARC_SEARCH_STEPS = 24;

export function initMagnetic(): void {
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const label = el.querySelector<HTMLElement>('.btn__label');
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    const lxTo = label ? gsap.quickTo(label, 'x', { duration: 0.5, ease: 'power3.out' }) : null;
    const lyTo = label ? gsap.quickTo(label, 'y', { duration: 0.5, ease: 'power3.out' }) : null;
    // Measured once per visit: reading the box while GSAP moves it feeds back.
    let center = { x: 0, y: 0 };

    el.addEventListener('pointerenter', () => {
      const box = el.getBoundingClientRect();
      center = { x: box.left + box.width / 2 - Number(gsap.getProperty(el, 'x')), y: box.top + box.height / 2 - Number(gsap.getProperty(el, 'y')) };
    });
    el.addEventListener('pointermove', (event) => {
      const dx = event.clientX - center.x;
      const dy = event.clientY - center.y;
      xTo(dx * MAGNET_STRENGTH);
      yTo(dy * MAGNET_STRENGTH);
      lxTo?.(dx * MAGNET_LABEL);
      lyTo?.(dy * MAGNET_LABEL);
    });
    el.addEventListener('pointerleave', () => {
      xTo(0);
      yTo(0);
      lxTo?.(0);
      lyTo?.(0);
    });
  });
}

/**
 * The WhatsApp mark becomes a key and turns while a light opens across the
 * button like a door. It starts on press, so it plays before the new tab.
 */
export function initKeyTurn(reduce: boolean): void {
  document.querySelectorAll<HTMLElement>('[data-wa]').forEach((link) => {
    const wa = link.querySelector<SVGElement>('.btn__icon--wa');
    const key = link.querySelector<SVGElement>('.btn__icon--key');
    if (!wa || !key) return;

    const tl = gsap.timeline({ paused: true });
    if (reduce) {
      tl.to(wa, { opacity: 0, duration: 0.15 }, 0).to(key, { opacity: 1, duration: 0.15 }, 0);
    } else {
      tl.to(wa, { opacity: 0, scale: 0.6, filter: 'blur(3px)', duration: 0.12, ease: 'power2.out' }, 0)
        .fromTo(key, { opacity: 0, x: -8, rotation: 0, scale: 0.8 }, { opacity: 1, x: 0, scale: 1, duration: 0.14, ease: 'power3.out' }, 0.04)
        .to(key, { rotation: 90, duration: 0.22, ease: 'back.out(2.2)' }, 0.18)
        .to(link, { '--door': '100%', duration: 0.3, ease: 'power2.out' }, 0.18);
    }

    let close: gsap.core.Tween | null = null;
    const open = (): void => {
      close?.kill();
      tl.play();
    };
    const closeLater = (): void => {
      close?.kill();
      close = gsap.delayedCall(KEY_HOLD_S, () => void tl.reverse());
    };
    link.addEventListener('pointerdown', open);
    link.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') open();
    });
    link.addEventListener('click', () => {
      open();
      closeLater();
    });
    // A press that is dragged away or cancelled must not leave the door open.
    link.addEventListener('pointercancel', closeLater);
    link.addEventListener('pointerleave', () => {
      if (tl.progress() > 0) closeLater();
    });
  });
}

/**
 * Hero photo fan: each card leans with its own depth, like prints on a table.
 * Returns a switch so the fan only listens while the hero is on screen.
 */
export function initFan(): (active: boolean) => void {
  const fan = document.querySelector<HTMLElement>('[data-fan]');
  if (!fan) return () => undefined;
  const cards = Array.from(fan.querySelectorAll<HTMLElement>('.fan__card'));
  const movers = cards.map((card) => {
    const depth = Number(card.dataset.depth ?? 1);
    return {
      depth,
      x: gsap.quickTo(card, 'x', { duration: 0.9, ease: 'power3.out' }),
      y: gsap.quickTo(card, 'y', { duration: 0.9, ease: 'power3.out' }),
      ry: gsap.quickTo(card, 'rotationY', { duration: 0.9, ease: 'power3.out' }),
      rx: gsap.quickTo(card, 'rotationX', { duration: 0.9, ease: 'power3.out' }),
    };
  });

  const onMove = (event: PointerEvent): void => {
    const nx = event.clientX / window.innerWidth - 0.5;
    const ny = event.clientY / window.innerHeight - 0.5;
    movers.forEach((m) => {
      m.x(nx * 34 * m.depth);
      m.y(ny * 22 * m.depth);
      m.ry(nx * 10 * m.depth);
      m.rx(-ny * 8 * m.depth);
    });
  };
  let listening = false;
  const setActive = (active: boolean): void => {
    if (active === listening) return;
    listening = active;
    if (active) window.addEventListener('pointermove', onMove);
    else window.removeEventListener('pointermove', onMove);
  };
  setActive(true);
  return setActive;
}

/** Apartment stage: hover or click a thumbnail to bring that photo forward. */
export function initStages(): void {
  document.querySelectorAll<HTMLElement>('[data-stage]').forEach((stage) => {
    const frames = Array.from(stage.querySelectorAll<HTMLElement>('[data-frame]'));
    const thumbs = Array.from(stage.querySelectorAll<HTMLButtonElement>('[data-thumb]'));
    const show = (index: number): void => {
      frames.forEach((frame, i) => frame.classList.toggle('is-active', i === index));
      thumbs.forEach((thumb, i) => thumb.classList.toggle('is-active', i === index));
    };
    thumbs.forEach((thumb, i) => {
      thumb.addEventListener('pointerenter', () => show(i));
      thumb.addEventListener('focus', () => show(i));
      thumb.addEventListener('click', () => show(i));
    });
  });
}

/** Reviews: one at a time, swapped with a short blur crossfade. Never drops a click. */
export function initReviews(reduce: boolean): void {
  const root = document.querySelector<HTMLElement>('[data-reviews]');
  if (!root) return;
  const slides = Array.from(root.querySelectorAll<HTMLElement>('[data-review]'));
  const counter = root.querySelector<HTMLElement>('[data-review-index]');
  let index = 0;
  let swap: gsap.core.Timeline | null = null;

  const go = (step: number): void => {
    if (slides.length < 2) return;
    swap?.progress(1); // finish the previous swap at once, then start this one
    const current = slides[index];
    index = (index + step + slides.length) % slides.length;
    const next = slides[index];
    if (counter) counter.textContent = String(index + 1);
    if (reduce) {
      current.hidden = true;
      next.hidden = false;
      return;
    }
    swap = gsap.timeline()
      .to(current, { opacity: 0, filter: 'blur(4px)', y: -6 * step, duration: REVIEW_OUT, ease: 'power2.out' })
      .add(() => {
        current.hidden = true;
        next.hidden = false;
      })
      .fromTo(
        next,
        { opacity: 0, filter: 'blur(4px)', y: 10 * step },
        { opacity: 1, filter: 'blur(0px)', y: 0, duration: REVIEW_IN, ease: 'expo.out' },
      );
  };

  root.querySelector('[data-review-prev]')?.addEventListener('click', () => go(-1));
  root.querySelector('[data-review-next]')?.addEventListener('click', () => go(1));
}

/** The point on a left-to-right path at the given x (x grows along the path). */
function pointAtX(path: SVGPathElement, x: number): DOMPoint {
  let lo = 0;
  let hi = path.getTotalLength();
  for (let i = 0; i < ARC_SEARCH_STEPS; i++) {
    const mid = (lo + hi) / 2;
    if (path.getPointAtLength(mid).x < x) lo = mid;
    else hi = mid;
  }
  return path.getPointAtLength((lo + hi) / 2);
}

/**
 * How: each step is a station on the arc of the day. The dot sits exactly on
 * the curve above the step's centre. Returns each station's place along the
 * arc (0..1), so the drawing arc can light them as it passes.
 */
export function placeStations(): number[] {
  const svg = document.querySelector<SVGSVGElement>('.how__arc');
  const path = svg?.querySelector<SVGPathElement>('[data-arc]');
  const list = document.querySelector<HTMLElement>('.steps');
  const steps = Array.from(document.querySelectorAll<HTMLElement>('[data-step]'));
  if (!svg || !path || !list || !steps.length) return [];
  // Layout offsets, not boxes: the steps may be mid-entrance (translated).
  const width = svg.clientWidth;
  const height = svg.clientHeight;
  if (!width) return [];
  const view = svg.viewBox.baseVal;

  return steps.map((step) => {
    const centerX = list.offsetLeft + step.offsetLeft + step.offsetWidth / 2;
    const top = list.offsetTop + step.offsetTop;
    const x = (centerX / width) * view.width;
    const point = pointAtX(path, x);
    const y = (point.y / view.height) * height - top;
    step.style.setProperty('--dot-y', `${y.toFixed(1)}px`);
    step.style.setProperty('--station', `${(y + 44).toFixed(1)}px`);
    // the arc is symmetric and drawn by length; its x share is close enough
    return Math.min(1, Math.max(0, x / view.width));
  });
}

const nbsp = (n: number): string => new Intl.NumberFormat('ru-RU').format(n).replace(/\s/g, ' ');

/** Price grows to its value: integers with thousands, or one decimal ("5,0"). */
export function countUp(el: HTMLElement, onStart?: () => void): gsap.core.Tween | null {
  const integer = el.dataset.count;
  const decimal = el.dataset.countDecimal;
  const target = Number(integer ?? decimal);
  if (!Number.isFinite(target)) return null;
  const state = { v: 0 };
  const paint = (): void => {
    el.textContent = decimal ? state.v.toFixed(1).replace('.', ',') : nbsp(Math.round(state.v / 100) * 100);
  };
  paint(); // start from zero, never flash the final value first
  return gsap.to(state, {
    v: target,
    duration: decimal ? 1.2 : 1.4,
    ease: 'expo.out',
    onStart,
    onUpdate: paint,
  });
}
