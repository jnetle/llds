#!/usr/bin/env node
import ts from 'typescript';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const projectsPath = resolve(root, 'lib', 'projects.ts');

const failures = [];

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
      }
    }

    items.push(record);
  }

  return items;
}

function derivedIntro(project) {
  return `A home in ${project.location}, completed in ${project.year} with ${project.builder}.`;
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
    } else if (seenAssetKeys.has(assetKey)) {
      fail('duplicate project assetKey', `  assetKey: ${assetKey}`, `  second occurrence: ${label}`);
    } else {
      seenAssetKeys.add(assetKey);
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
    const summary = project.summary ?? intro;
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
