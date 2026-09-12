// Batch-compress project photos for hosting on R2.
//
// Walks <inputDir> recursively, caps width at MAX_WIDTH, and steps JPEG quality down until the file is <= MAX_BYTES,
// mirroring the input tree into <outputDir>. Matches the <=200 KB / <=2400 px target in AGENTS.md.
//
// Usage: node scripts/compress-images.mjs <inputDir> <outputDir> [--min-quality=N]
//
// A handful of frames in a shoot are too detailed to reach MAX_BYTES at any usable quality — dense stone, grout,
// foliage. Those bottom out at MIN_QUALITY with visible blocking baked into a file that is the *source* every
// next/image derivative is made from, so the artifacts reach visitors even though these bytes never do. Raising the
// floor with --min-quality trades bucket storage, which nobody downloads, for fidelity that everybody sees. See the
// project-photography exception in AGENTS.md before reaching for it.

import { readdir, mkdir, writeFile } from 'node:fs/promises';
import { join, relative, dirname, extname, basename } from 'node:path';
import sharp from 'sharp';

const MAX_WIDTH = 2400;
const MAX_BYTES = 200 * 1024;
const DEFAULT_MIN_QUALITY = 40;
const EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.heic']);

const args = process.argv.slice(2);
const [inputDir, outputDir] = args.filter(a => !a.startsWith('--'));
if (!inputDir || !outputDir) {
  console.error('Usage: node scripts/compress-images.mjs <inputDir> <outputDir> [--min-quality=N]');
  process.exit(1);
}

const minQualityArg = args.find(a => a.startsWith('--min-quality='))?.split('=')[1];
const MIN_QUALITY = minQualityArg === undefined ? DEFAULT_MIN_QUALITY : Number(minQualityArg);
if (!Number.isInteger(MIN_QUALITY) || MIN_QUALITY < 1 || MIN_QUALITY > 100) {
  console.error(`--min-quality must be an integer from 1 to 100; received ${minQualityArg}`);
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
      // Write the measured buffer itself — sharp(buf).toFile() would re-encode at the default quality,
      // inflating the file well past the byteLength this loop just checked against MAX_BYTES.
      await writeFile(out, buf);
      const kb = (buf.byteLength / 1024).toFixed(0);
      const flag = buf.byteLength > MAX_BYTES ? ' (over budget at min quality)' : '';
      // Dimensions are printed because a gallery plate's `aspect` in lib/projects.ts is read off this output —
      // the masonry template reserves each tile's box from it before the file loads.
      const { width, height } = await sharp(buf).metadata();
      console.log(`${outRel}  ${width}x${height}  ${kb} KB  q${quality}${flag}`);
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
