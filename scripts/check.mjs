#!/usr/bin/env node
/*
 * Static package-contract check. Run from anywhere:
 *   node scripts/check.mjs
 *
 * It verifies the parts of the DSH client-plugin contract that can be checked
 * without booting a Harness profile:
 *   - package.json declares dsh.client { platform: web, inject: string[] }
 *   - exports["./client"] points at an existing file
 *   - the client bundle registers the same id as the package name
 *   - the host main entry exists
 */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));

const checks = [];
function check(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    checks.push(error);
    console.error(`FAIL - ${name}: ${error.message}`);
  }
}

check('dsh.bundle.patch exists', () => {
  const patch = pkg.dsh?.bundle?.patch;
  if (typeof patch !== 'string') throw new Error('missing dsh.bundle.patch');
  if (!existsSync(path.join(root, patch))) throw new Error(`${patch} does not exist`);
});

check('dsh.client.platform is web', () => {
  if (pkg.dsh?.client?.platform !== 'web') throw new Error('missing or not "web"');
});

check('dsh.client.inject is a string array', () => {
  if (!Array.isArray(pkg.dsh?.client?.inject) || pkg.dsh.client.inject.some((id) => typeof id !== 'string')) {
    throw new Error('missing or malformed inject array');
  }
});

check('exports["./client"] resolves to an existing file', () => {
  const client = pkg.exports?.['./client'];
  if (typeof client !== 'string') throw new Error('exports["./client"] must be a string');
  if (!existsSync(path.join(root, client))) throw new Error(`${client} does not exist`);
});

check('host main entry exists', () => {
  const main = pkg.main || pkg.exports?.['.'] || pkg.exports?.['.']?.default;
  const file = typeof main === 'string' ? main : null;
  if (!file || !existsSync(path.join(root, file))) throw new Error(`main entry missing: ${file}`);
});

check('client bundle registers the package-name id', () => {
  const client = pkg.exports['./client'];
  const source = readFileSync(path.join(root, client), 'utf8');
  if (!source.includes(`id: '${pkg.name}'`) && !source.includes(`id: "${pkg.name}"`)) {
    throw new Error(`no window.__ModuleLoader__.load id for "${pkg.name}"`);
  }
  if (!source.includes('window.__ModuleLoader__.load')) {
    throw new Error('missing window.__ModuleLoader__.load registration');
  }
});

if (checks.length > 0) {
  console.error(`\n${checks.length} check(s) failed`);
  process.exit(1);
}
console.log('\nAll dsh-performance-slider package checks passed.');
