#!/usr/bin/env node
/*
 * Remove dsh-performance-slider from the default dsh web profile.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const dshHome = process.env.DSH_HOME
  ? path.resolve(process.env.DSH_HOME)
  : path.join(os.homedir(), '.dsh');
const profileDir = path.join(dshHome, 'profiles', 'web');
const patchPath = path.join(profileDir, 'cordis.patch.yml');

const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const remove = spawnSync(pnpm, ['--dir', profileDir, 'remove', 'dsh-performance-slider'], {
  stdio: 'inherit',
  env: process.env,
});
if (remove.status !== 0) {
  console.error(`[dsh-performance-slider] pnpm remove exited with status ${remove.status}`);
  process.exit(1);
}

if (existsSync(patchPath)) {
  const patch = readFileSync(patchPath, 'utf8');
  // Remove only this package's exact `- insert:` block (3 lines); a sliding
  // window would swallow a neighbouring plugin's block and corrupt the YAML.
  const lines = patch.split('\n');
  const out = [];
  let skip = 0;
  for (let i = 0; i < lines.length; i++) {
    if (skip > 0) { skip -= 1; continue; }
    const insert = /^(\s*)- insert:\s*$/.exec(lines[i]);
    if (insert) {
      const idLine = lines[i + 1] ?? '';
      const nameLine = lines[i + 2] ?? '';
      const idMatch = /^\s+- id:\s*(\S+)\s*$/.exec(idLine);
      const nameMatch = /^\s+name:\s*(\S+)\s*$/.exec(nameLine);
      if (
        idMatch && nameMatch
        && idMatch[1] === 'dsh-performance-slider'
        && nameMatch[1] === 'dsh-performance-slider'
      ) {
        skip = 2; // drop the two following lines (id + name rows)
        continue;
      }
    }
    out.push(lines[i]);
  }
  let next = out.join('\n').replace(/\n{3,}/g, '\n\n').replace(/\n+$/, '\n');
  if (next.trim() === '') next = '[]\n';
  if (next !== patch) writeFileSync(patchPath, next, 'utf8');
}

console.log('[dsh-performance-slider] removed. Restart dsh web.');
