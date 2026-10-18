// Orchestration: smooth scroll, the day that runs with the scroll, the hero
// entrance, and the scroll scenes. Content is visible without JS; only the
// hero waits for its entrance (html.intro, with a timeout fallback in Base).
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { initNowClock } from './nowclock';
import { createSky, cssSky, type SkyRenderer } from './sky';
import { ARC_LOW, ARC_PEAK, almatyHourNow, darkAfter, phaseOf, skyAt } from './daycycle';
import { initCatalog } from './catalog';
import {
  countUp,
  initFan,
  initKeyTurn,
  initMagnetic,
  initReviews,
  initStages,
  placeStations,
} from './interact';

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const EXPO = 'expo.out';
const DESKTOP = '(min-width: 1000px)';
const REAL_CLOCK_MS = 10_000;
const PORTRAIT_RATIO = 0.8; // narrower than this is a phone held upright
const PHONE_ARC_PEAK = 0.9; // highest point of the sun or moon on a phone
const PHONE_ARC_SHAPE = 0.8; // below 1: a touch higher than desktop, clear of the headings
const HEADER_SOLID_AT = 60;
const VELOCITY_FULL = 60; // Lenis px/frame that counts as a full time-lapse

/* ---------- the day ---------- */

// The page always opens at night (moon high, stars out); scrolling then runs
// the day from there. Not the real hour: a daytime start looked flat.
const START_HOUR = 23.6;
const day = { start: START_HOUR, progress: 0 };
let sky: SkyRenderer | null = null;
let lastDark: boolean | null = null;
let lastGreeting = '';

const greeting = document.querySelector<HTMLElement>('[data-greeting]');

function currentHour(): number {
  return day.start + day.progress * 24;
}

/** The greeting speaks to the visitor's own time of day. */
function renderGreeting(): void {
  if (!greeting) return;
  const phase = phaseOf(almatyHourNow());
  const text = greeting.dataset[phase] ?? '';
  if (!text || text === lastGreeting) return;
  lastGreeting = text;
  greeting.textContent = text;
}

/**
 * On a tall phone screen the arc of the sky would put the sun or moon right
 * behind the headings; there it runs in the upper right of the sky instead.
 */
function fitBody(body: readonly [number, number]): [number, number] {
  if (window.innerWidth / window.innerHeight >= PORTRAIT_RATIO) return [body[0], body[1]];
  // One smooth curve from behind the ridges up to the upper right: it lifts
  // the body a little higher than on desktop, with no knee where it brakes.
  const height = gsap.utils.clamp(0, 1, (body[1] - ARC_LOW) / (ARC_PEAK - ARC_LOW));
  return [0.58 + body[0] * 0.36, ARC_LOW + height ** PHONE_ARC_SHAPE * (PHONE_ARC_PEAK - ARC_LOW)];
}

function renderDay(): void {
  const hour = currentHour();
  const raw = skyAt(hour);
  const state = { ...raw, body: fitBody(raw.body), isDark: darkAfter(hour, lastDark) };
  sky?.setSky(state);
  sky?.setScroll(day.progress);
  if (state.isDark !== lastDark) {
    document.documentElement.dataset.sky = state.isDark ? 'dark' : 'light';
    lastDark = state.isDark;
  }
  renderGreeting();
}

function initRealClock(): void {
  // The contacts clock is the real Almaty time, not the page's scroll time;
  // a large sun or moon above it leans softly with the cursor (nowclock.ts).
  const clock = initNowClock({ follow: finePointer && !reduce });
  const tick = (): void => clock?.setReal(almatyHourNow());
  ScrollTrigger.create({
    trigger: '#contacts',
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => clock?.setFollow(self.isActive),
  });
  tick();
  window.setInterval(tick, REAL_CLOCK_MS);
}

function initDay(): void {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-sky-canvas]');
  if (canvas) {
    try {
      sky = createSky(canvas, { reduce });
    } catch (error) {
      console.error('[motion] sky unavailable, using CSS gradient', error);
      sky = cssSky(canvas);
    }
  }
  renderDay();
  sky?.start();

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      day.progress = self.progress;
      renderDay();
    },
  });

  if (finePointer) {
    window.addEventListener('pointermove', (event) => {
      sky?.setMouse(event.clientX / window.innerWidth, 1 - event.clientY / window.innerHeight);
    });
  }

  window.addEventListener('resize', renderDay);
  initRealClock();
}

/* ---------- smooth scroll ---------- */

function initLenis(): void {
  const lenis = new Lenis({ lerp: 0.09, anchors: { offset: -96 } });
  lenis.on('scroll', (event: Lenis) => {
    ScrollTrigger.update();
    // A fast scroll turns the sky into a time-lapse.
    sky?.setVelocity(gsap.utils.clamp(0, 1, Math.abs(event.velocity) / VELOCITY_FULL));
  });
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ---------- entrances ---------- */

/**
 * Lines rise from a mask; re-split (and the tween rebuilt) when fonts or width
 * change. A heading that has already risen is not played again on a re-split.
 */
function revealLines(el: HTMLElement, vars: gsap.TweenVars): void {
  let shown = false;
  SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'line',
    autoSplit: true,
    onSplit: (self) => {
      if (shown) return undefined;
      return gsap.from(self.lines, { yPercent: 115, ease: EXPO, ...vars, onComplete: () => void (shown = true) });
    },
  });
}

function heroIntro(): void {
  const title = document.querySelector<HTMLElement>('.hero [data-split]');
  const rises = gsap.utils.toArray<HTMLElement>('.hero [data-rise]');
  const cards = gsap.utils.toArray<HTMLElement>('.fan__card');
  const price = document.querySelector<HTMLElement>('.hero [data-count]');
  const tl = gsap.timeline({ delay: 0.15 });

  if (title) revealLines(title, { duration: 1.2, stagger: 0.09, delay: 0.15 });
  tl.from(rises, { y: 26, opacity: 0, filter: 'blur(6px)', duration: 1, ease: EXPO, stagger: 0.07 }, 0.35);
  tl.from(cards, {
    y: 160,
    rotation: (i: number) => (i - 1) * 14,
    opacity: 0,
    duration: 1.4,
    ease: EXPO,
    stagger: 0.1,
  }, 0.2);
  if (price) {
    const tween = countUp(price);
    if (tween) tl.add(tween, 0.6);
  }
  document.documentElement.classList.remove('intro');
}

function sectionReveals(): void {
  gsap.utils.toArray<HTMLElement>('main [data-split], .footer [data-split]').forEach((el) => {
    if (el.closest('.hero')) return;
    revealLines(el, { duration: 1.1, stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });
  gsap.utils.toArray<HTMLElement>('main [data-rise]').forEach((el) => {
    if (el.closest('.hero')) return;
    gsap.from(el, {
      y: 30,
      opacity: 0,
      duration: 1,
      ease: EXPO,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
  gsap.utils.toArray<HTMLElement>('[data-count-decimal]').forEach((el) => {
    // Start from zero right away, so the final value never shows before the count.
    el.textContent = (0).toFixed(1).replace('.', ',');
    ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => void countUp(el) });
  });
}

/* ---------- scenes ---------- */

/** Leaving the hero, the photos are picked up off the table as the sky moves on. */
function heroExit(): void {
  const cards = gsap.utils.toArray<HTMLElement>('.fan__card');
  gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 } })
    .to('.hero__fan', { yPercent: -16, ease: 'none' }, 0)
    .to(cards, { xPercent: (i: number) => (i - 1) * 14, ease: 'none' }, 0)
    .to('.hero__copy', { yPercent: -10, opacity: 0.15, ease: 'none' }, 0);
}

/** Catalogue cards rise in a gentle stagger the first time the grid is seen. */
function catalogReveal(): void {
  const grid = document.querySelector<HTMLElement>('[data-catalog-grid]');
  if (!grid) return;
  const shown = gsap.utils.toArray<HTMLElement>('[data-card]').filter((card) => !card.hidden);
  gsap.from(shown, {
    y: 40,
    opacity: 0,
    duration: 0.9,
    ease: EXPO,
    stagger: 0.07,
    clearProps: 'transform,opacity', // Flip takes over the cards afterwards
    scrollTrigger: { trigger: grid, start: 'top 85%', once: true },
  });
}

/** The quilt: patches arrive and settle, then their stitches are sewn. */
function quilt(): void {
  const patches = gsap.utils.toArray<HTMLElement>('[data-patch]');
  gsap.set(patches, { opacity: 0, y: 48, rotation: () => gsap.utils.random(-3, 3) });
  // Start before the row reaches the screen, so the cloth is already sewn
  // by the time the visitor looks at it: no holes in the quilt.
  ScrollTrigger.batch(patches, {
    start: 'top bottom+=160',
    once: true,
    onEnter: (batch) => {
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        rotation: 0,
        duration: 0.85,
        ease: EXPO,
        stagger: 0.05,
        onComplete: () => batch.forEach((el) => el.classList.add('is-sewn')),
      });
    },
  });
}

/**
 * The arc of the day under the three steps is revealed left to right with
 * scroll (a mask, so it moves every frame) and lights each station it reaches.
 */
function stepsArc(): void {
  const arc = document.querySelector<SVGSVGElement>('.how__arc');
  const steps = gsap.utils.toArray<HTMLElement>('[data-step]');
  let stations = placeStations();
  ScrollTrigger.addEventListener('refresh', () => (stations = placeStations()));
  if (arc) {
    gsap.fromTo(arc, { clipPath: 'inset(-20px 100% -20px -20px)' }, {
      clipPath: 'inset(-20px 0% -20px -20px)',
      ease: 'none',
      scrollTrigger: {
        trigger: '.how__sheet',
        start: 'top 80%',
        end: 'center 45%',
        scrub: 1,
        onUpdate: (self) => {
          if (!stations.length) return; // phones have no arc: see below
          steps.forEach((step, i) => step.classList.toggle('is-lit', self.progress >= (stations[i] ?? 1) - 0.02));
        },
      },
    });
  }
  // Phones: the timeline lights each station as it scrolls into view.
  gsap.matchMedia().add('(max-width: 999px)', () => {
    steps.forEach((step) => {
      ScrollTrigger.create({ trigger: step, start: 'top 70%', once: true, onEnter: () => step.classList.add('is-lit') });
    });
  });
  gsap.from('.step', {
    y: 40,
    opacity: 0,
    duration: 1,
    ease: EXPO,
    stagger: 0.14,
    scrollTrigger: { trigger: '.steps', start: 'top 80%', once: true },
  });
}

/** The one marquee: drifts on its own, runs with the scroll, pauses offscreen. */
function marquee(): void {
  const track = document.querySelector<HTMLElement>('[data-marquee]');
  if (!track) return;
  const loop = gsap.to(track, { xPercent: -50, duration: 38, ease: 'none', repeat: -1, paused: true });
  const speedTo = gsap.quickTo(loop, 'timeScale', { duration: 0.3, ease: 'power2.out' });
  let settle: gsap.core.Tween | null = null;
  ScrollTrigger.create({
    trigger: track,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
    onUpdate: (self) => {
      const boost = 1 + Math.min(4, Math.abs(self.getVelocity()) / 600);
      speedTo(boost * (self.direction || 1));
      // when the scroll stops, drift back to the calm pace in the same direction
      settle?.kill();
      settle = gsap.delayedCall(0.15, () => speedTo(self.direction || 1));
    },
  });
}

/**
 * Phones: the bottom bar slides in once the hero's button has scrolled away,
 * and steps aside again where the contacts show their own big button.
 */
function bottomBar(): void {
  const bar = document.querySelector<HTMLElement>('.bottom-bar');
  const own = document.querySelectorAll<HTMLElement>('.hero__actions, .contacts__actions');
  if (!bar || !own.length) return;
  const visible = new Set<Element>();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => (entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target)));
    bar.classList.toggle('is-shown', visible.size === 0);
  });
  own.forEach((el) => observer.observe(el));
}

/** The pile of photos on the «another apartment» card fans out when seen. */
function morePile(): void {
  const card = document.querySelector<HTMLElement>('[data-more]');
  if (!card) return;
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    card.classList.add('is-seen');
    observer.disconnect();
  }, { threshold: 0.35 });
  observer.observe(card);
}

function header(): void {
  const el = document.querySelector<HTMLElement>('[data-header]');
  if (!el) return;
  const solid = (scroll: number): void => void el.classList.toggle('is-scrolled', scroll > HEADER_SOLID_AT);
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => solid(self.scroll()),
    onRefresh: (self) => solid(self.scroll()),
  });
}

/* ---------- boot ---------- */

function boot(): void {
  initDay();
  initKeyTurn(reduce);
  initStages();
  initReviews(reduce);
  initCatalog(reduce);
  bottomBar();
  morePile();

  if (reduce) {
    header();
    document.documentElement.classList.remove('intro');
    document.querySelectorAll('[data-step]').forEach((step) => step.classList.add('is-lit'));
    document.querySelectorAll('[data-patch]').forEach((patch) => patch.classList.add('is-sewn'));
    placeStations();
    ScrollTrigger.addEventListener('refresh', () => void placeStations());
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return;
  }

  initLenis();
  // Pinned scenes first: triggers below them must measure with the pin spacer.
  gsap.matchMedia().add(DESKTOP, () => {
    heroExit();
  });
  header();
  heroIntro();
  sectionReveals();
  catalogReveal();
  quilt();
  stepsArc();
  marquee();
  if (finePointer) {
    initMagnetic();
    const setFan = initFan();
    ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', onToggle: (self) => setFan(self.isActive) });
  }

  // Fonts change line breaks: re-measure once they are in.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

boot();
