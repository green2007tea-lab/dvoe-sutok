// Prepares photos taken from the 2GIS card: crops the bottom strip with the
// camera timestamp ("vivo V29 …") and the 2GIS watermark, caps the size.
// Source: source/2gis/*.jpg  →  Output: src/assets/photos/*.jpg
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const SRC_DIR = 'source/2gis';
const OUT_DIR = 'src/assets/photos';
const BOTTOM_CROP = 0.09; // share of height removed from the bottom
const MAX_SIDE = 1600;

// One grade for the whole series: phone shots from different cameras should
// read as one set. Slight lift, a little warmth, gentle contrast.
const GRADE = {
  brightness: 1.05,
  saturation: 1.12,
  contrast: 1.07, // linear slope around mid-grey
  warmth: [1.03, 1.0, 0.95], // per-channel multiplier R, G, B
};

// source file → output name (grouped by apartment, see src/data/apartments.ts)
const PHOTOS = {
  'interior-1.jpg': 'a1-living.jpg',
  'rooms-2.jpg': 'a1-studio.jpg',
  'rooms-4.jpg': 'a1-bed.jpg',
  'rooms-1.jpg': 'a2-living.jpg',
  'rooms-5.jpg': 'a2-bed.jpg',
  'interior-2.jpg': 'a2-kitchen.jpg',
  'rooms-6.jpg': 'a2-bath.jpg',
  'rooms-3-owner.jpg': 'a3-bedroom.jpg',
};

async function prepare(srcName, outName) {
  const src = path.join(SRC_DIR, srcName);
  const { width, height } = await sharp(src).metadata();
  const keepHeight = Math.round(height * (1 - BOTTOM_CROP));
  await sharp(src)
    .extract({ left: 0, top: 0, width, height: keepHeight })
    .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true })
    .modulate({ brightness: GRADE.brightness, saturation: GRADE.saturation })
    .linear(
      GRADE.warmth.map((w) => w * GRADE.contrast),
      GRADE.warmth.map(() => -(128 * GRADE.contrast) + 128),
    )
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(path.join(OUT_DIR, outName));
  return `${srcName} → ${outName}`;
}

await mkdir(OUT_DIR, { recursive: true });
const results = await Promise.all(
  Object.entries(PHOTOS).map(([src, out]) => prepare(src, out)),
);
results.forEach((line) => process.stdout.write(`${line}\n`));
