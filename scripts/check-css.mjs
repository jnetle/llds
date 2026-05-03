#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const cssPath = resolve(here, '..', 'app', 'globals.css');
const css = readFileSync(cssPath, 'utf8');

// Strip comments so commented-out rules don't trigger false positives.
const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');

// Match each rule block: `selector { body }` (no nested braces in this codebase).
const ruleRegex = /([^{}]+)\{([^{}]*)\}/g;
const offenders = [];

for (const match of stripped.matchAll(ruleRegex)) {
  const selector = match[1].trim();
  const body = match[2];

  // Selector list contains html, body, or :root as a standalone selector.
  const selectors = selector.split(',').map(s => s.trim().toLowerCase());
  const targetsRoot = selectors.some(s => s === 'html' || s === 'body' || s === ':root');
  if (!targetsRoot) continue;

  // Body declares overflow / overflow-x / overflow-y: hidden (NOT clip).
  // `hidden` creates a scroll container and breaks position: sticky on descendants;
  // `clip` does not (per spec) — so `overflow-x: clip` is the safe way to suppress
  // horizontal overflow at the root.
  if (/\boverflow(-x|-y)?\s*:\s*hidden\b/i.test(body)) {
    offenders.push({ selector, body: body.trim() });
  }
}

if (offenders.length > 0) {
  console.error('check-css: forbidden overflow on root element');
  console.error('');
  for (const { selector, body } of offenders) {
    console.error(`  ${selector} {`);
    console.error(`    ${body.replace(/\s+/g, ' ')}`);
    console.error('  }');
  }
  console.error('');
  console.error('overflow: hidden on html/body/:root breaks position: sticky on every');
  console.error('descendant (e.g. the Services page quick-links nav). Remove the rule and');
  console.error('constrain the actually-overflowing element instead. See AGENTS.md.');
  process.exit(1);
}
