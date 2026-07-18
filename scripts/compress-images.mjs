// Batch-compress project photos for hosting on R2.
//
// Walks <inputDir> recursively, caps each image's width at MAX_WIDTH, and steps
// JPEG quality down until the file is <= MAX_BYTES, writing .jpg files that mirror
// the input tree into <outputDir>. Matches the CLAUDE.md target (<=200 KB, <=2400 px)
// and the slug convention consumed by lib/projects.ts (projects/<slug>/cover.jpg, etc.).
//
// Usage:
//   node scripts/compress-images.mjs <inputDir> <outputDir>
//
// Example (originals grouped by slug, output ready to upload to R2):
//   node scripts/compress-images.mjs ./raw-photos ./dist-photos

import { readdir, mkdir } from 'node:fs/promises';
import { join, relative, dirname, extname, basename } from 'node:path';
import sharp from 'sharp';

const MAX_WIDTH = 2400;
const MAX_BYTES = 200 * 1024;
const MIN_QUALITY = 40;
const EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.heic']);

const [inputDir, outputDir] = process.argv.slice(2);
if (!inputDir || !outputDir) {
  console.error('Usage: node scripts/compress-images.mjs <inputDir> <outputDir>');
  process.exit(1);
}

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (EXTS.has(extname(entry.name).toLowerCase())) yield p;
  }
}

async function compress(src) {
  const rel = relative(inputDir, src);
  const outRel = join(dirname(rel), `${basename(rel, extname(rel))}.jpg`);
  const out = join(outputDir, outRel);
  await mkdir(dirname(out), { recursive: true });

  const base = sharp(src).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true });

  for (let quality = 82; quality >= MIN_QUALITY; quality -= 6) {
    const buf = await base.clone().jpeg({ quality, mozjpeg: true }).toBuffer();
    if (buf.byteLength <= MAX_BYTES || quality - 6 < MIN_QUALITY) {
      await sharp(buf).toFile(out);
      const kb = (buf.byteLength / 1024).toFixed(0);
      const flag = buf.byteLength > MAX_BYTES ? ' (over budget at min quality)' : '';
      console.log(`${outRel}  ${kb} KB  q${quality}${flag}`);
      return;
    }
  }
}

let count = 0;
for await (const src of walk(inputDir)) {
  await compress(src);
  count++;
}
console.log(`\nDone: ${count} image(s) -> ${outputDir}`);
