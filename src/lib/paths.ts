// Site-relative links that keep working when the site lives under a sub-path
// (GitHub Pages serves it at /<repo>/). Locally the base is just "/".
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** "/kz/" → "/dvoe-sutok/kz/" on GitHub Pages, "/kz/" locally. */
export const withBase = (path: string): string => `${BASE}${path}`;
