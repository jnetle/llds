#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const cssPath = resolve(root, 'app', 'globals.css');
const css = readFileSync(cssPath, 'utf8');

// Strip comments so commented-out rules don't trigger false positives.
const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');

const failures = [];

function fail(title, ...detail) {
  failures.push([title, ...detail]);
}

// ── 1. No overflow:hidden on the root ────────────────────────────────────────

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

  // Body declares overflow / overflow-x / overflow-y: hidden (NOT clip). `hidden` creates a scroll container and
  // breaks position: sticky on descendants; `clip` does not, so it is the safe way to suppress root overflow.
  if (/\boverflow(-x|-y)?\s*:\s*hidden\b/i.test(body)) {
    offenders.push({ selector, body: body.trim() });
  }
}

if (offenders.length > 0) {
  const lines = [];
  for (const { selector, body } of offenders) {
    lines.push(`  ${selector} {`, `    ${body.replace(/\s+/g, ' ')}`, '  }');
  }
  fail(
    'forbidden overflow on root element',
    ...lines,
    '',
    'overflow: hidden on html/body/:root breaks position: sticky on every',
    'descendant (e.g. the Services page quick-links nav). Remove the rule and',
    'constrain the actually-overflowing element instead. See AGENTS.md.'
  );
}

// ── 2. No selectors that match against inline-style text ─────────────────────
// `[style*='…']` couples CSS to the exact serialisation of a style attribute. React emits `height:100vh` unspaced
// during SSR, but the CSSOM re-serialises it spaced once React updates the element, so such a rule switches on
// mid-session. Style a class instead.

const attrSelectors = [...stripped.matchAll(/[^{}]*\[style\*=[^\]]*\][^{}]*(?=\{)/g)].map(m => m[0].trim());

if (attrSelectors.length > 0) {
  fail(
    'selector matches against inline-style text',
    ...attrSelectors.map(s => `  ${s}`),
    '',
    'A [style*=…] rule fires or not depending on whether React last wrote the',
    'style attribute during SSR (unspaced) or via the CSSOM (spaced), so it can',
    'activate mid-scroll. Put a class on the element and style that instead.'
  );
}

// ── 3. Section's padding classes match the sectionPadY token table ───────────
// Section.tsx hard-codes its padding as complete Tailwind class strings, because Tailwind only emits classes it can
// find as literal source text. That duplicates lib/tokens.ts, so assert the two stay in step.

const tokens = readFileSync(resolve(root, 'lib', 'tokens.ts'), 'utf8');
const section = readFileSync(resolve(root, 'components', 'ui', 'Section.tsx'), 'utf8');

function block(source, header, terminator) {
  const start = source.indexOf(header);
  if (start === -1) return null;
  const end = source.indexOf(terminator, start);
  return end === -1 ? null : source.slice(start + header.length, end);
}

const padTokens = block(tokens, 'export const sectionPadY = {', '} as const;');

if (!padTokens) {
  fail('could not locate sectionPadY in lib/tokens.ts', '  The check-css drift guard needs updating alongside it.');
} else {
  const expected = new Map();
  for (const m of padTokens.matchAll(/'?([\w]+|2xl)'?:\s*\{\s*d:\s*(\d+),\s*m:\s*(\d+)\s*\}/g)) {
    expected.set(m[1], { d: Number(m[2]), m: Number(m[3]) });
  }

  // 'pt-[24px] sm:pt-[60px]' → { m: 24, d: 60 }; 'pt-0' → { m: 0, d: 0 }.
  function parseClasses(value, prefix) {
    const read = scope => {
      const px = value.match(new RegExp(`(?:^|\\s)${scope}${prefix}-\\[(\\d+)px\\]`));
      if (px) return Number(px[1]);
      return new RegExp(`(?:^|\\s)${scope}${prefix}-0(?:\\s|$)`).test(value) ? 0 : null;
    };
    const m = read('');
    const d = read('sm:');
    return { m, d: d ?? m };
  }

  for (const [name, prefix] of [
    ['PAD_TOP', 'pt'],
    ['PAD_BOTTOM', 'pb']
  ]) {
    const body = block(section, `const ${name}: Record<SectionPad, string> = {`, '};');
    if (!body) {
      fail(`could not locate ${name} in components/ui/Section.tsx`, '  The check-css drift guard needs updating alongside it.');
      continue;
    }

    const seen = new Set();
    for (const m of body.matchAll(/'?([\w]+|2xl)'?:\s*'([^']+)'/g)) {
      const [, key, classes] = m;
      seen.add(key);
      const want = expected.get(key);
      if (!want) {
        fail(`${name}.${key} has no matching sectionPadY preset`, `  ${name}: '${classes}'`);
        continue;
      }
      const got = parseClasses(classes, prefix);
      if (got.m !== want.m || got.d !== want.d) {
        fail(
          `${name}.${key} has drifted from sectionPadY.${key}`,
          `  tokens:  { d: ${want.d}, m: ${want.m} }`,
          `  classes: '${classes}'  → { d: ${got.d}, m: ${got.m} }`
        );
      }
    }

    for (const key of expected.keys()) {
      if (!seen.has(key)) fail(`${name} is missing the '${key}' preset defined in sectionPadY`);
    }
  }
}

// ── Report ───────────────────────────────────────────────────────────────────

if (failures.length > 0) {
  for (const [title, ...detail] of failures) {
    console.error(`check-css: ${title}`);
    console.error('');
    for (const line of detail) console.error(line);
    console.error('');
  }
  process.exit(1);
}
