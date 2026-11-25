// Spotlight @crisxai5 — make.fun X-post entry (Node 22, standard library only).
//
// The entry is the X post itself: an original spotlight image introducing
// @crisxai5 as a must-follow AI & crypto expert, posted publicly from
// @ryandho3 with the required mention, link, hashtags and play code.
// This program only hands the post's address to the gate: it reads
// POST.json from the repository root, checks the address shape, and
// writes it to /output/POST.json. The house reads the post's counts
// from X itself; nothing written here is scored.
//
// Local run (outside the grader's container):
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const POST_FILE = 'POST.json';
const SOURCE_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const TARGET_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// An X post address, as the bounty rules allow it: x.com or twitter.com,
// optional www. or mobile. prefix, <handle>/status/<digits> (or
// /i/web/status/<id>). A query string or fragment after the id is read
// past by the gate.
const POST_URL_PATTERN =
  /^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/(i\/web\/status\/\d+|[^/]+\/status\/\d+)([?#].*)?$/;
const MIN_URL_LENGTH = 20;

function validatePost(url: unknown): asserts url is string {
  if (typeof url !== 'string' || url.length < MIN_URL_LENGTH) {
    throw new Error(`POST.json url is not a usable string: ${JSON.stringify(url)}`);
  }
  if (!POST_URL_PATTERN.test(url)) {
    throw new Error(`POST.json url is not an X post address: ${url}`);
  }
}

const sourcePath = join(SOURCE_DIR, POST_FILE);
const targetPath = join(TARGET_DIR, POST_FILE);

const raw = readFileSync(sourcePath, 'utf8');
const post = JSON.parse(raw) as { url: string };
validatePost(post.url);

mkdirSync(TARGET_DIR, { recursive: true });
writeFileSync(targetPath, raw, 'utf8');

// Byte-level read-back: the file the gate reads must be exactly what the
// repository holds, so compare the written bytes with the source bytes.
const written = readFileSync(targetPath);
const source = readFileSync(sourcePath);
if (!written.equals(source)) {
  console.error(`Read-back mismatch: ${targetPath} differs from ${sourcePath}`);
  process.exit(1);
}
console.log(`Wrote ${post.url} to ${targetPath} (verified byte-for-byte)`);
