// Apartments from the company's own listings on Krisha.kz (see facts.md).
// House numbers are left out on purpose: the exact address goes out after booking.
// Photos: free CC0 demo shots (stocksnap.io) until the owner sends real ones;
// the bureau's own photos stay in source/2gis.
import type { ImageMetadata } from 'astro';
import { todo, type Maybe } from './site';
import a1Living from '../assets/photos/a1-living.jpg';
import a1Studio from '../assets/photos/a1-studio.jpg';
import a1Bed from '../assets/photos/a1-bed-hd.jpg';
import a2Living from '../assets/photos/a2-living.jpg';
import a2Bed from '../assets/photos/a2-bed.jpg';
import a2Kitchen from '../assets/photos/a2-kitchen.jpg';
import a2Bath from '../assets/photos/a2-bath.jpg';
import a3Bedroom from '../assets/photos/a3-bedroom.jpg';
import d01 from '../assets/photos/d01.jpg';
import d02 from '../assets/photos/d02.jpg';
import d03 from '../assets/photos/d03.jpg';
import d04 from '../assets/photos/d04.jpg';
import d05 from '../assets/photos/d05.jpg';
import d06 from '../assets/photos/d06.jpg';
import d07 from '../assets/photos/d07.jpg';
import d08 from '../assets/photos/d08.jpg';
import d09 from '../assets/photos/d09.jpg';
import d10 from '../assets/photos/d10.jpg';
import d11 from '../assets/photos/d11.jpg';
import d12 from '../assets/photos/d12.jpg';
import d13 from '../assets/photos/d13.jpg';
import d14 from '../assets/photos/d14.jpg';

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
  /** A made-up example for the demo, not one of the bureau's listings. */
  readonly demo?: boolean;
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
  // From the bureau's archived Krisha listings (facts.md): real, but whether
  // they are let now is unknown.
  {
    id: 'abaya-99',
    street: { ru: 'пр. Абая', kz: 'Абай даңғылы' },
    rooms: '1',
    area: '36',
    floor: '3/4',
    guests: '2',
    price: 20000,
    photos: [
      { src: d13, alt: { ru: 'Спальня с полосатым пледом', kz: 'Жолақты жамылғысы бар жатын бөлме' } },
      { src: d11, alt: { ru: 'Кухня у окна', kz: 'Терезе жанындағы ас үй' } },
    ],
  },
  {
    id: 'seyfullina',
    street: { ru: 'пр. Сейфуллина', kz: 'Сейфуллин даңғылы' },
    rooms: '1',
    area: '40',
    floor: '8/8',
    guests: todo('2'),
    price: 20000,
    photos: [
      { src: d06, alt: { ru: 'Светлая спальня у окна', kz: 'Терезе жанындағы жарық жатын бөлме' } },
      { src: d09, alt: { ru: 'Уголок для чтения у окна', kz: 'Терезе жанындағы кітап оқу бұрышы' } },
    ],
  },
  {
    id: 'panfilova',
    street: { ru: 'ул. Панфилова', kz: 'Панфилов көшесі' },
    rooms: '2',
    area: '40',
    floor: '3/5',
    guests: '2',
    price: 25000,
    photos: [
      { src: d07, alt: { ru: 'Гостиная с креслами и растениями', kz: 'Креслолар мен өсімдіктері бар қонақ бөлме' } },
      { src: d03, alt: { ru: 'Белая спальня с большой кроватью', kz: 'Үлкен төсегі бар ақ жатын бөлме' } },
    ],
  },
  // Demo examples so the owner sees how a full catalogue looks (marked on the page).
  {
    id: 'zhibek-zholy',
    street: { ru: 'пр. Жибек Жолы', kz: 'Жібек жолы даңғылы' },
    rooms: '2',
    area: '58',
    floor: '5/9',
    guests: '4',
    price: 28000,
    demo: true,
    photos: [
      { src: d02, alt: { ru: 'Гостиная-лофт с кирпичной стеной', kz: 'Кірпіш қабырғалы лофт қонақ бөлме' } },
      { src: d04, alt: { ru: 'Спальня с деревянной отделкой', kz: 'Ағаш әрленген жатын бөлме' } },
    ],
  },
  {
    id: 'tole-bi',
    street: { ru: 'ул. Толе би', kz: 'Төле би көшесі' },
    rooms: '1',
    area: '34',
    floor: '2/5',
    guests: '2',
    price: 18000,
    demo: true,
    photos: [
      { src: d12, alt: { ru: 'Белый диван и столик', kz: 'Ақ диван мен үстел' } },
      { src: d10, alt: { ru: 'Кресло у светлой стены', kz: 'Жарық қабырға жанындағы кресло' } },
    ],
  },
  {
    id: 'kabanbay',
    street: { ru: 'ул. Кабанбай батыра', kz: 'Қабанбай батыр көшесі' },
    rooms: '3',
    area: '78',
    floor: '6/12',
    guests: '6',
    price: 35000,
    demo: true,
    photos: [
      { src: d08, alt: { ru: 'Уютная гостиная с камином', kz: 'Каминді жайлы қонақ бөлме' } },
      { src: d05, alt: { ru: 'Спальня с мягким вечерним светом', kz: 'Кешкі жұмсақ жарығы бар жатын бөлме' } },
    ],
  },
  {
    id: 'baitursynova',
    street: { ru: 'ул. Байтурсынова', kz: 'Байтұрсынұлы көшесі' },
    rooms: '1',
    area: '42',
    floor: '7/10',
    guests: '3',
    price: 22000,
    demo: true,
    photos: [
      { src: d01, alt: { ru: 'Светлая гостиная с белым диваном', kz: 'Ақ диваны бар жарық қонақ бөлме' } },
      { src: d09, alt: { ru: 'Уголок для чтения у окна', kz: 'Терезе жанындағы кітап оқу бұрышы' } },
    ],
  },
  {
    id: 'gogolya',
    street: { ru: 'ул. Гоголя', kz: 'Гоголь көшесі' },
    rooms: '2',
    area: '52',
    floor: '4/5',
    guests: '4',
    price: 26000,
    demo: true,
    photos: [
      { src: d14, alt: { ru: 'Светлая гостиная в спокойных тонах', kz: 'Тыныш реңктегі жарық қонақ бөлме' } },
      { src: d06, alt: { ru: 'Светлая спальня у окна', kz: 'Терезе жанындағы жарық жатын бөлме' } },
    ],
  },
  {
    id: 'nauryzbay',
    street: { ru: 'ул. Наурызбай батыра', kz: 'Наурызбай батыр көшесі' },
    rooms: '1',
    area: '38',
    floor: '3/9',
    guests: '2',
    price: 20000,
    demo: true,
    photos: [
      { src: d04, alt: { ru: 'Спальня с деревянной отделкой', kz: 'Ағаш әрленген жатын бөлме' } },
      { src: d11, alt: { ru: 'Кухня у окна', kz: 'Терезе жанындағы ас үй' } },
    ],
  },
  {
    id: 'zheltoksan',
    street: { ru: 'ул. Желтоксан', kz: 'Желтоқсан көшесі' },
    rooms: '2',
    area: '60',
    floor: '9/14',
    guests: '5',
    price: 30000,
    demo: true,
    photos: [
      { src: d03, alt: { ru: 'Белая спальня с большой кроватью', kz: 'Үлкен төсегі бар ақ жатын бөлме' } },
      { src: d02, alt: { ru: 'Гостиная-лофт с кирпичной стеной', kz: 'Кірпіш қабырғалы лофт қонақ бөлме' } },
    ],
  },
];
