import { ru, type Dict } from './ru';
import { kz } from './kz';
import type { Lang } from '../data/apartments';

const DICTS: Record<Lang, Dict> = { ru, kz };

export const getDict = (lang: Lang): Dict => DICTS[lang];

/** Fills {key} placeholders: fmt('от {price} ₸', { price: '20 000' }). */
export const fmt = (template: string, values: Record<string, string | number>): string =>
  template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );

/** 20000 → «20 000» with a non-breaking space, same in both languages. */
export const formatPrice = (value: number): string =>
  new Intl.NumberFormat('ru-RU').format(value).replace(/\s/g, ' ');
