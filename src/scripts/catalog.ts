// Apartment catalogue: filter chips and «show all». The grid reflows with
// GSAP Flip: cards glide to their new places, leaving ones fade out, new ones
// grow in. Without JS every card is simply shown.
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(Flip);

const FIRST_DESKTOP = 5; // with the «another apartment» card: two full rows of three
const FIRST_PHONE = 4;
const PHONE = '(max-width: 999px)';
const FLIP_S = 0.5;
const FLIP_EASE = 'power4.inOut'; // close to --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)

export function initCatalog(reduce: boolean): void {
  const root = document.querySelector<HTMLElement>('[data-catalog]');
  if (!root) return;
  const chips = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-filter]'));
  const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-card]'));
  const more = root.querySelector<HTMLButtonElement>('[data-catalog-more]');
  const first = (): number => (window.matchMedia(PHONE).matches ? FIRST_PHONE : FIRST_DESKTOP);

  let filter = 'all';
  let expanded = false;

  /** Show the cards of the current filter: the first few, or all once expanded. */
  const layout = (): void => {
    const listings = cards.filter((card) => !card.hasAttribute('data-keep'));
    const matching = listings.filter((card) => (card.dataset.tags ?? '').split(' ').includes(filter));
    const limit = expanded ? Infinity : first();
    listings.forEach((card) => {
      const place = matching.indexOf(card);
      card.hidden = place < 0 || place >= limit;
    });
    if (more) {
      more.hidden = matching.length <= limit;
      more.textContent = (more.dataset.label ?? '').replace('{n}', String(matching.length));
    }
  };

  /** Change the layout, animating the grid from where it was. */
  const change = (update: () => void): void => {
    if (reduce) {
      update();
      layout();
      ScrollTrigger.refresh();
      return;
    }
    const state = Flip.getState(cards);
    update();
    layout();
    Flip.from(state, {
      duration: FLIP_S,
      ease: FLIP_EASE,
      absolute: true,
      nested: true,
      prune: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'power3.out', delay: 0.12 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.94, duration: 0.25, ease: 'power2.out' }),
      onComplete: () => ScrollTrigger.refresh(),
    });
  };

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      if (chip.dataset.filter === filter) return;
      change(() => {
        filter = chip.dataset.filter ?? 'all';
        expanded = false;
        chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      });
    });
  });
  more?.addEventListener('click', () => change(() => (expanded = true)));

  layout();
}
