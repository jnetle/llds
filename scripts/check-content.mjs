#!/usr/bin/env node
import ts from 'typescript';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const projectsPath = resolve(root, 'lib', 'projects.ts');
const piecesPath = resolve(root, 'lib', 'pieces.ts');

const failures = [];

const KEBAB_KEY_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function fail(title, ...detail) {
  failures.push([title, ...detail]);
}

function parseProjectsMeta() {
  const sourceText = readFileSync(projectsPath, 'utf8');
  const sf = ts.createSourceFile(projectsPath, sourceText, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS);

  let decl = null;

  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === 'PROJECT_META') {
      decl = node;
      return;
    }
    ts.forEachChild(node, visit);
  }

  visit(sf);

  if (!decl?.initializer || !ts.isArrayLiteralExpression(decl.initializer)) {
    fail('could not locate PROJECT_META array in lib/projects.ts');
    return [];
  }

  const items = [];

  for (const element of decl.initializer.elements) {
    if (!ts.isObjectLiteralExpression(element)) {
      fail('PROJECT_META contains a non-object entry', `  entry: ${element.getText(sf)}`);
      continue;
    }

    const record = {};

    for (const prop of element.properties) {
      if (!ts.isPropertyAssignment(prop)) continue;
      if (!ts.isIdentifier(prop.name) && !ts.isStringLiteral(prop.name)) continue;
      const key = prop.name.text;
      const value = prop.initializer;
      if (ts.isStringLiteralLike(value) || ts.isNoSubstitutionTemplateLiteral(value)) {
        record[key] = value.text;
      } else if (ts.isArrayLiteralExpression(value)) {
        // `intro` is authored as an array of paragraphs. Without this the property is dropped, every check below
        // falls through to its derived default, and the guards go quiet on exactly the records that need them.
        const strings = value.elements.filter(el => ts.isStringLiteralLike(el) || ts.isNoSubstitutionTemplateLiteral(el));
        if (strings.length === value.elements.length) record[key] = strings.map(el => el.text);
      }
    }

    items.push(record);
  }

  return items;
}

// Mirrors deriveIntro in lib/projects.ts, which returns one entry per paragraph.
function derivedIntro(project) {
  return [`A home in ${project.location}, completed in ${project.year} with ${project.builder}.`];
}

function checkProjects() {
  const projects = parseProjectsMeta();
  if (projects.length === 0) return;

  const seenSlugs = new Set();
  const seenAssetKeys = new Set();

  for (const [index, project] of projects.entries()) {
    const label = `PROJECT_META[${index}]`;

    const slug = project.slug;
    if (!slug) {
      fail('project record is missing slug', `  ${label}: ${JSON.stringify(project)}`);
    } else if (seenSlugs.has(slug)) {
      fail('duplicate project slug', `  slug: ${slug}`, `  second occurrence: ${label}`);
    } else {
      seenSlugs.add(slug);
    }

    const assetKey = project.assetKey;
    if (!assetKey) {
      fail('project record is missing assetKey', `  ${label}: ${JSON.stringify(project)}`);
    } else {
      if (seenAssetKeys.has(assetKey)) {
        fail('duplicate project assetKey', `  assetKey: ${assetKey}`, `  second occurrence: ${label}`);
      } else {
        seenAssetKeys.add(assetKey);
      }

      if (!KEBAB_KEY_RE.test(assetKey)) {
        fail('project assetKey must be lowercase kebab-case', `  ${label}: assetKey=${assetKey}`);
      }
    }

    const yearNum = Number(project.year);
    if (!project.year || !Number.isFinite(yearNum)) {
      fail('project year must be a numeric string', `  ${label}: slug=${slug ?? '(missing)'}, year=${String(project.year)}`);
    }

    const location = project.location;
    const builder = project.builder;
    if (!location || !builder) {
      fail('project record missing required field for derived summary checks', `  ${label}: slug=${slug ?? '(missing)'}`);
      continue;
    }

    const intro = project.intro ?? derivedIntro(project);
    // `intro` is an array of paragraphs, so take the first the way buildProject does. Reading `.length` off the
    // array itself would be the item count — always 1 or 2, always under the limit, and the check would go quiet.
    const summary = project.summary ?? intro[0] ?? '';
    if (summary.length > 160) {
      fail('project summary exceeds 160 characters', `  slug: ${slug}`, `  length: ${summary.length}`, `  summary: ${summary}`);
    }
  }

  for (let i = 1; i < projects.length; i += 1) {
    const prev = Number(projects[i - 1].year);
    const next = Number(projects[i].year);
    if (!Number.isFinite(prev) || !Number.isFinite(next)) continue;
    if (next > prev) {
      fail(
        'PROJECT_META is not sorted by descending year',
        `  index ${i - 1}: slug=${projects[i - 1].slug ?? '(missing)'}, year=${projects[i - 1].year ?? '(missing)'}`,
        `  index ${i}: slug=${projects[i].slug ?? '(missing)'}, year=${projects[i].year ?? '(missing)'}`
      );
    }
  }
}

// ── Photo credits ───────────────────────────────────────────────────────────
// `buildProject` drops a credit whose `piece` names nothing, deliberately: lib/projects.ts is imported by every page,
// so throwing there would take the whole site down in dev over one typo. That makes the dangling slug invisible in
// the derived data, and invisible to the vitest guards, which only ever see resolved credits. It is visible here, in
// the authored source — so this is the check that catches it.

function sourceFileFor(path) {
  return ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS);
}

/** The array literal initialising a top-level `const <name> = [...]`, or null. */
function findArrayDecl(sourceFile, name) {
  let found = null;

  function visit(node) {
    if (found) return;
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === name) {
      if (node.initializer && ts.isArrayLiteralExpression(node.initializer)) found = node.initializer;
      return;
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return found;
}

/** A string-valued property of an object literal, or undefined. */
function stringProp(objectLiteral, key) {
  for (const prop of objectLiteral.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    if (!ts.isIdentifier(prop.name) && !ts.isStringLiteral(prop.name)) continue;
    if (prop.name.text !== key) continue;
    const value = prop.initializer;
    if (ts.isStringLiteralLike(value) || ts.isNoSubstitutionTemplateLiteral(value)) return value.text;
  }
  return undefined;
}

/** An object-valued property of an object literal, or undefined. */
function objectProp(objectLiteral, key) {
  for (const prop of objectLiteral.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    if (!ts.isIdentifier(prop.name) && !ts.isStringLiteral(prop.name)) continue;
    if (prop.name.text !== key) continue;
    if (ts.isObjectLiteralExpression(prop.initializer)) return prop.initializer;
  }
  return undefined;
}

/** An array-valued property of an object literal, or undefined. */
function arrayProp(objectLiteral, key) {
  for (const prop of objectLiteral.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    if (!ts.isIdentifier(prop.name) && !ts.isStringLiteral(prop.name)) continue;
    if (prop.name.text !== key) continue;
    if (ts.isArrayLiteralExpression(prop.initializer)) return prop.initializer;
  }
  return undefined;
}

function parsePieceSlugs() {
  const sf = sourceFileFor(piecesPath);
  const decl = findArrayDecl(sf, 'PIECE_META');

  if (!decl) {
    fail('could not locate PIECE_META array in lib/pieces.ts');
    return null;
  }

  const slugs = new Set();
  for (const element of decl.elements) {
    if (!ts.isObjectLiteralExpression(element)) continue;
    const slug = stringProp(element, 'slug');
    if (slug) slugs.add(slug);
  }
  return slugs;
}

function checkCredits() {
  const pieceSlugs = parsePieceSlugs();
  if (!pieceSlugs) return;

  const sf = sourceFileFor(projectsPath);
  const decl = findArrayDecl(sf, 'PROJECT_META');
  if (!decl) return; // already reported by parseProjectsMeta

  for (const [index, element] of decl.elements.entries()) {
    if (!ts.isObjectLiteralExpression(element)) continue;

    const slug = stringProp(element, 'slug') ?? `PROJECT_META[${index}]`;
    const hero = stringProp(element, 'hero');
    const gallery = arrayProp(element, 'gallery');
    if (!gallery) continue;

    for (const plate of gallery.elements) {
      if (!ts.isObjectLiteralExpression(plate)) continue;

      const credit = objectProp(plate, 'credit');
      if (!credit) continue;

      const file = stringProp(plate, 'file') ?? '(unknown file)';
      const piece = stringProp(credit, 'piece');
      const note = stringProp(credit, 'note');

      if (!piece) {
        fail('photo credit is missing `piece`', `  project: ${slug}`, `  file: ${file}`);
      } else if (!pieceSlugs.has(piece)) {
        fail(
          'photo credit names a piece that does not exist in lib/pieces.ts',
          `  project: ${slug}`,
          `  file: ${file}`,
          `  piece: ${piece}`,
          '  The credit would be silently dropped and never render.'
        );
      }

      if (!note || note.trim() === '') {
        fail('photo credit has an empty `note`', `  project: ${slug}`, `  file: ${file}`);
      }

      // The detail page renders the gallery minus the hero frame, so a credit there can never appear.
      if (hero && file === hero) {
        fail(
          'photo credit sits on the frame `hero` names',
          `  project: ${slug}`,
          `  file: ${file}`,
          '  The detail page drops that frame from the gallery, so the caption would never render.'
        );
      }
    }
  }
}

function checkEnvUrl(name, { httpsOnly = false } = {}) {
  const raw = process.env[name];
  if (!raw) return;

  try {
    const parsed = new URL(raw);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      fail(`${name} must use http or https when set`, `  received: ${raw}`);
      return;
    }
    if (httpsOnly && parsed.protocol !== 'https:') {
      fail(`${name} must use https when set`, `  received: ${raw}`);
    }
  } catch {
    fail(`${name} must be an absolute URL when set`, `  received: ${raw}`);
  }
}

checkProjects();
checkCredits();
checkEnvUrl('NEXT_PUBLIC_SITE_URL');
checkEnvUrl('NEXT_PUBLIC_IMG_BASE', { httpsOnly: true });

if (failures.length > 0) {
  for (const [title, ...detail] of failures) {
    console.error(`check-content: ${title}`);
    console.error('');
    for (const line of detail) console.error(line);
    console.error('');
  }
  process.exit(1);
}
