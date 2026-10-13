// Apartments from the company's own listings on Krisha.kz (see facts.md).
// House numbers are left out on purpose: the exact address goes out after booking.
// Photos: free CC0 demo shots (stocksnap.io) until the owner sends real ones;
// the bureau's own photos stay in source/2gis.
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
      { src: a2Living, alt: { ru: 'Комната с телевизором и рабочим столом', kz: 'Теледидары мен жұмыс үстелі бар бөлме' } },
      { src: a2Bed, alt: { ru: 'Спальня с большой кроватью и тёплым светом', kz: 'Үлкен төсегі мен жылы жарығы бар жатын бөлме' } },
      { src: a2Kitchen, alt: { ru: 'Кухня: стол у окна, плита и чайник', kz: 'Ас үй: терезе жанындағы үстел, плита және шәйнек' } },
      { src: a2Bath, alt: { ru: 'Ванная с душевой', kz: 'Душы бар жуынатын бөлме' } },
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
      { src: a1Living, alt: { ru: 'Гостиная с зелёным диваном и выходом на балкон', kz: 'Жасыл диваны мен балконы бар қонақ бөлме' } },
      { src: a1Studio, alt: { ru: 'Светлая комната с синим диваном', kz: 'Көк диваны бар жарық бөлме' } },
      { src: a1Bed, alt: { ru: 'Спальня с белым изголовьем и шкафом', kz: 'Ақ бас тұсы мен шкафы бар жатын бөлме' } },
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
      { src: a3Bedroom, alt: { ru: 'Светлая спальня с большими окнами', kz: 'Үлкен терезелері бар жарық жатын бөлме' } },
    ],
  },
];
