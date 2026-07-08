// ============================================================================
// Post-build inliner: fold the hashed JS + CSS emitted by `vite build` into a
// single self-contained standalone/index.html. No dependencies — pure Node.
//
// Why this exists: the app is fully backendless (hash routing, relative paths,
// localStorage, no network calls at runtime), so once the JS and CSS are inlined
// the result is ONE portable file that runs on any static host, on Heroku
// behind a trivial static server, or opened directly from disk via file://.
// ============================================================================

import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const outDir = resolve(root, 'standalone');
const outFile = resolve(outDir, 'index.html');

/**
 * Neutralize any literal "</script" / "</style" inside inlined code so the HTML
 * parser can't terminate the tag early. Backslash-slash is identical to slash in
 * JS and CSS, so this changes nothing semantically.
 */
function escapeForTag(code, tag) {
  return code.replace(new RegExp(`</(${tag})`, 'gi'), '<\\/$1');
}

let html = readFileSync(resolve(dist, 'index.html'), 'utf8');

// Pull the actual hashed filenames straight from the built HTML.
const scriptMatch = html.match(
  /<script\b[^>]*\bsrc="\.?\/?(assets\/[^"]+\.js)"[^>]*><\/script>/i,
);
const styleMatch = html.match(
  /<link\b[^>]*\bhref="\.?\/?(assets\/[^"]+\.css)"[^>]*>/i,
);

if (!scriptMatch) {
  throw new Error('inline: could not find the built <script src="assets/*.js"> tag');
}

const jsPath = resolve(dist, scriptMatch[1]);
const js = escapeForTag(readFileSync(jsPath, 'utf8'), 'script');
// IMPORTANT: use a replacer FUNCTION, not a string. Minified JS/CSS contains
// "$&", "$`", etc., which are special patterns in String.replace when the
// replacement is a string (they'd re-insert the matched tag). A function
// replacement is inserted verbatim, with no "$" interpretation.
html = html.replace(scriptMatch[0], () => `<script type="module">\n${js}\n</script>`);

if (styleMatch) {
  const cssPath = resolve(dist, styleMatch[1]);
  const css = escapeForTag(readFileSync(cssPath, 'utf8'), 'style');
  html = html.replace(styleMatch[0], () => `<style>\n${css}\n</style>`);
}

// Sanity check: no external asset references should remain.
const leftover = html.match(/(?:src|href)="\.?\/?assets\/[^"]+"/g);
if (leftover) {
  throw new Error(`inline: external asset refs still present: ${leftover.join(', ')}`);
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, html, 'utf8');

const kb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
console.log(`\n✓ Standalone single-file build written:`);
console.log(`  ${outFile}  (${kb} KB, self-contained)\n`);
