import { defineConfig } from 'astro/config';

// On GitHub Pages the workflow passes SITE and BASE (https://<user>.github.io, /<repo>).
export default defineConfig({
  site: process.env.SITE ?? 'https://dvoesutok.kz', // [УТОЧНИТЬ У ВЛАДЕЛЬЦА] домен
  base: process.env.BASE ?? '/',
  i18n: {
    locales: ['ru', 'kz'],
    defaultLocale: 'ru',
  },
});
