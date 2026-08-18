/**
 * dsh-performance-slider — node/host half.
 *
 * Besides providing the host entry for the client plugin, this half serves the
 * 31 local cutout frames from `/plugins/dsh-performance-slider/frames/…`.
 * The browser half addresses them as
 * `/plugins/dsh-performance-slider/frames/frame-00.png` … `frame-30.png`.
 */
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const PACKAGE_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const FRAME_DIR = join(PACKAGE_ROOT, 'demo', 'pics', 'cutout');
const FRAME_PREFIX = '/plugins/dsh-performance-slider/frames';

/** Decode a request pathname; null on malformed percent-encoding (never throw). */
function decodePathname(url) {
  try {
    return decodeURIComponent(new URL(url ?? '/', 'http://x').pathname);
  } catch {
    return null;
  }
}

export const inject = ['webServer'];

export function apply(ctx) {
  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: FRAME_PREFIX,
    handler: async (req, res) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405);
        res.end();
        return;
      }
      const pathname = decodePathname(req.url);
      if (pathname === null) {
        res.writeHead(400);
        res.end();
        return;
      }
      if (!pathname.startsWith(`${FRAME_PREFIX}/`)) {
        res.writeHead(404);
        res.end();
        return;
      }
      const rel = pathname.slice(FRAME_PREFIX.length + 1);
      if (!/^frame-\d{2}\.png$/.test(rel)) {
        res.writeHead(404);
        res.end();
        return;
      }
      const file = resolve(join(FRAME_DIR, rel));
      if (file !== FRAME_DIR && !file.startsWith(FRAME_DIR + sep)) {
        res.writeHead(403);
        res.end();
        return;
      }
      try {
        const body = await readFile(file);
        res.writeHead(200, {
          'content-type': 'image/png',
          'cache-control': 'public, max-age=3600',
          'x-content-type-options': 'nosniff',
        });
        res.end(req.method === 'HEAD' ? undefined : body);
      } catch {
        res.writeHead(404);
        res.end();
      }
    },
  }), 'dsh-performance-slider: cutout frame images');
}
