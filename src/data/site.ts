// Business facts. Verified ones come from the 2GIS card (2026-10-08);
// everything wrapped in todo() still has to be confirmed by the owner.

/** Show yellow [УТОЧНИТЬ У ВЛАДЕЛЬЦА] marks on the page. Turn off before the demo. */
export const SHOW_TODO_MARKS = true;

export const TODO_LABEL = '[УТОЧНИТЬ У ВЛАДЕЛЬЦА]';

/** A value that still needs the owner's confirmation. */
export interface Todo {
  readonly todo: string;
}

export type Maybe = string | Todo;

export const todo = (value: string): Todo => ({ todo: value });

export const isTodo = (value: Maybe): value is Todo => typeof value !== 'string';

export const plain = (value: Maybe): string => (isTodo(value) ? value.todo : value);

export const PHONE = {
  digits: '77767779295',
  display: '+7 776 777 92 95',
  tel: 'tel:+77767779295',
} as const;

export const LINKS = {
  telegram: 'https://t.me/+77767779295',
  twoGis: 'https://2gis.kz/almaty/firm/70000001083381030',
  twoGisReviews: 'https://2gis.kz/almaty/firm/70000001083381030/tab/reviews',
} as const;

export const PRICE_FROM = 20000;

export const RATING = {
  value: 5,
  votes: 20,
  reviews: 12,
} as const;

export const CHECK_IN: Maybe = todo('14:00');
export const CHECK_OUT: Maybe = todo('12:00');
