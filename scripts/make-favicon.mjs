// Build app/icon.svg from the two brand icon PNGs (one per color scheme).
//
// The source exports carry a wide transparent border and are not square. This trims each to its alpha bounds,
// re-pads to a square, downscales, and inlines both as base64 in one SVG that swaps them via prefers-color-scheme.
// One SVG rather than two files plus `media` on <link>: the color logic lives in the file, so it works in browsers
// that ignore `media` on favicon links and fits Next's app/icon.svg convention.
//
// Usage: node scripts/make-favicon.mjs <light-mode.png> <dark-mode.png>
// Light mode takes the Navy Ink artwork, dark mode the Bone White one — the mark sits on the tab-bar color.

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

// Fraction of the square canvas left empty on the mark's longest axis — tight, so the mark nearly fills the tab
// slot without its anti-aliased edge sitting flush against the frame.
const MARGIN = 0.02;
// Favicon slots render at 16/32/48px; 256 leaves retina headroom while keeping the base64 payload small.
const SIZE = 256;
const ALPHA_THRESHOLD = 16;
const OUT = join(process.cwd(), 'app', 'icon.svg');

const [lightSrc, darkSrc] = process.argv.slice(2);
if (!lightSrc || !darkSrc) {
  console.error('Usage: node scripts/make-favicon.mjs <light-mode.png> <dark-mode.png>');
  process.exit(1);
}

// Tightest rectangle containing every non-transparent pixel.
async function alphaBounds(src) {
  const { width, height } = await sharp(src).metadata();
  const raw = await sharp(src).ensureAlpha().raw().toBuffer();
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (raw[(y * width + x) * 4 + 3] <= ALPHA_THRESHOLD) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < 0) throw new Error(`${src} is fully transparent`);
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

// Trim to `box`, centre on a transparent square, and downscale to SIZE.
//
// Two passes on purpose: sharp runs `extend` after `resize` within one pipeline whatever the call order, so doing
// both at once pads the already-downscaled image at full-resolution widths and yields a stretched canvas.
async function squareCrop(src, box) {
  const canvas = Math.round(Math.max(box.width, box.height) / (1 - 2 * MARGIN));
  const left = Math.round((canvas - box.width) / 2);
  const top = Math.round((canvas - box.height) / 2);

  const squared = await sharp(src)
    .extract(box)
    .extend({
      left,
      top,
      right: canvas - box.width - left,
      bottom: canvas - box.height - top,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  return sharp(squared).resize(SIZE, SIZE).png({ compressionLevel: 9, palette: true }).toBuffer();
}

// Same artwork in different ink, so union the bounds to keep the two crops pixel-aligned even if an export drifts.
const [lightBox, darkBox] = await Promise.all([alphaBounds(lightSrc), alphaBounds(darkSrc)]);
const right = Math.max(lightBox.left + lightBox.width, darkBox.left + darkBox.width);
const bottom = Math.max(lightBox.top + lightBox.height, darkBox.top + darkBox.height);
const box = {
  left: Math.min(lightBox.left, darkBox.left),
  top: Math.min(lightBox.top, darkBox.top),
  width: right - Math.min(lightBox.left, darkBox.left),
  height: bottom - Math.min(lightBox.top, darkBox.top)
};

const [light, dark] = await Promise.all([squareCrop(lightSrc, box), squareCrop(darkSrc, box)]);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}">
  <style>
    .scheme-dark { display: none; }
    @media (prefers-color-scheme: dark) {
      .scheme-light { display: none; }
      .scheme-dark { display: inline; }
    }
  </style>
  <image class="scheme-light" width="${SIZE}" height="${SIZE}" href="data:image/png;base64,${light.toString('base64')}" />
  <image class="scheme-dark" width="${SIZE}" height="${SIZE}" href="data:image/png;base64,${dark.toString('base64')}" />
</svg>
`;

await writeFile(OUT, svg);

const kb = n => (n / 1024).toFixed(1);
console.log(`source bounds  ${box.width}x${box.height} at (${box.left}, ${box.top})`);
console.log(`light  ${kb(light.byteLength)} KB   dark  ${kb(dark.byteLength)} KB`);
console.log(`app/icon.svg  ${kb(Buffer.byteLength(svg))} KB`);
