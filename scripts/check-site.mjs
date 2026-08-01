import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize, resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const required = [
  'assets/css/site.css',
  'assets/css/admin.css',
  'assets/js/site.js',
  'assets/js/gallery.js',
  'assets/js/gallery-data.js',
  'assets/js/admin.js',
  'assets/vendor/fflate.min.js',
  'assets/images/branding/logo-on-dark.svg',
  'assets/images/branding/logo-on-light.svg',
  'assets/images/branding/favicon.svg',
  'scripts/check-site.mjs',
];

const failures = [];
required.forEach((path) => {
  if (!existsSync(join(root, path))) failures.push(`Missing required file: ${path}`);
});

const ignoredDirectories = new Set(['.git', 'node_modules']);
const walk = (directory) => readdirSync(directory).flatMap((name) => {
  const path = join(directory, name);
  if (statSync(path).isDirectory() && ignoredDirectories.has(name)) return [];
  return statSync(path).isDirectory() ? walk(path) : [path];
});

const htmlFiles = walk(root).filter((path) => extname(path) === '.html');
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const references = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
  for (const reference of references) {
    if (/^(?:https?:|mailto:|tel:|data:|#)/.test(reference)) continue;
    const clean = reference.split(/[?#]/)[0];
    const target = normalize(join(dirname(file), clean));
    if (!existsSync(target)) failures.push(`${file.slice(root.length + 1)} references missing ${reference}`);
  }
  if (html.includes('<span>Scott Simpson</span>')) failures.push(`${file.slice(root.length + 1)} still uses the old text wordmark.`);
}

const catalog = readFileSync(join(root, 'assets/js/gallery-data.js'), 'utf8');
for (const field of ['desktopCheckout', 'standardPrintCheckout', 'printCheckout']) {
  if (!catalog.includes(field)) failures.push(`gallery-data.js does not document ${field}.`);
}

if (failures.length) {
  console.error(`Site check failed with ${failures.length} problem(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Site check passed: ${htmlFiles.length} HTML pages and ${required.length} required files validated.`);
