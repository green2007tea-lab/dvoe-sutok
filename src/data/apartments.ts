// Apartments from the company's own listings on Krisha.kz (see facts.md).
// House numbers are left out on purpose: the exact address goes out after booking.
// Photos come from 2GIS; which apartment each photo shows is not confirmed yet.
import type { ImageMetadata } from 'astro';
import { todo, type Maybe } from './site';
import a1Living from '../assets/photos/a1-living.jpg';
import a1Studio from '../assets/photos/a1-studio.jpg';
import a1Bed from '../assets/photos/a1-bed.jpg';
import a2Living from '../assets/photos/a2-living.jpg';
import a2Bed from '../assets/photos/a2-bed.jpg';
import a2Kitchen from '../assets/photos/a2-kitchen.jpg';
import a2Bath from '../assets/photos/a2-bath.jpg';
import a3Bedroom from '../assets/photos/a3-bedroom.jpg';

export type Lang = 'ru' | 'kz';
export type Localized<T> = Record<Lang, T>;

export interface Photo {
  readonly src: ImageMetadata;
  readonly alt: Localized<string>;
}

export interface Apartment {
  readonly id: string;
  readonly street: Localized<string>;
  readonly rooms: Maybe;
  readonly area: Maybe; // m²
  readonly floor: Maybe; // "3/4"
  readonly guests: Maybe;
  readonly price: number; // ₸ per day
  /** Shown above the card when availability is unknown. */
  readonly availability?: Localized<Maybe>;
  readonly photos: readonly Photo[];
}

/** Photos were matched to apartments by interior, not confirmed by the owner. */
export const PHOTOS_MATCH_CONFIRMED = false;

export const APARTMENTS: readonly Apartment[] = [
  {
    id: 'muratbaeva',
    street: { ru: 'ул. Муратбаева', kz: 'Мұратбаев көшесі' },
    rooms: '1',
    area: '35',
    floor: '3/4',
    guests: '2',
    price: 20000,
    photos: [
      { src: a2Living, alt: { ru: 'Комната с телевизором и кондиционером', kz: 'Теледидары мен кондиционері бар бөлме' } },
      { src: a2Bed, alt: { ru: 'Двуспальная кровать', kz: 'Екі кісілік төсек' } },
      { src: a2Kitchen, alt: { ru: 'Кухня с плитой и столом у окна', kz: 'Плитасы мен терезе жанында үстелі бар ас үй' } },
      { src: a2Bath, alt: { ru: 'Ванная комната', kz: 'Жуынатын бөлме' } },
    ],
  },
  {
    id: 'abaya-24',
    street: { ru: 'пр. Абая', kz: 'Абай даңғылы' },
    rooms: '1',
    area: '50',
    floor: '3/9',
    guests: '4',
    price: 20000,
    photos: [
      { src: a1Living, alt: { ru: 'Гостиная с бирюзовым диваном и большим окном', kz: 'Көгілдір диваны мен үлкен терезесі бар қонақ бөлме' } },
      { src: a1Studio, alt: { ru: 'Комната: диван, комод и двуспальная кровать', kz: 'Бөлме: диван, комод және екі кісілік төсек' } },
      { src: a1Bed, alt: { ru: 'Кровать со свежим бельём', kz: 'Таза төсек-орын салынған төсек' } },
    ],
  },
  {
    id: 'abaya-16',
    street: { ru: 'пр. Абая', kz: 'Абай даңғылы' },
    rooms: todo('2'),
    area: '45',
    floor: '4/5',
    guests: '5',
    price: 20000,
    availability: {
      ru: todo('Сдаётся ли сейчас'),
      kz: todo('Қазір жалға беріле ме'),
    },
    photos: [
      { src: a3Bedroom, alt: { ru: 'Просторная спальня с большим окном', kz: 'Үлкен терезесі бар кең жатын бөлме' } },
    ],
  },
];
