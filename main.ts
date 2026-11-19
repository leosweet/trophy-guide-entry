// Leonida Legend — the gta6-trophy-guide-01 entry program (Node 22, standard library
// only). The guide itself is plain static files in this directory's app/ folder:
// index.html opens it, its modules and styles live beside it, and the trophy list
// with our guides is app/data/trophies.json. It needs no build step and loads
// nothing over the network, so it works with the network off.
//
// This program hands the guide in: it copies app/ and screenshots/ from beside
// this file into the output directory and writes output/dossier.json with the
// vendored make.fun library — the summary the judge reads (screenshots, first-load
// files and bytes, and our source). vendor/makefun-frontend.ts stays untouched:
// the scorer rebuilds the dossier with its own copy and compares byte for byte.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// (MAKEFUN_OUTPUT_DIR stands in for /output outside the grader's container.)

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes;
// the others refuse an entry the scorer would refuse (more than 4 screenshots or one
// over 256 KiB; more than 993 files and directories in app/ or 48 MiB of app files:
// app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
// Keep the guide compact: the dossier text is capped at 163,840 bytes, so the
// 55 guides stay short and the source stays split into small files.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
