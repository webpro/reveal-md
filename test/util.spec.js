import test from 'node:test';
import { strict as assert } from 'assert';
import path from 'node:path';
import url from 'node:url';
import { getFilePaths } from '../lib/util.js';
import { getFilesGlob } from '../lib/config.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(__dirname, 'fixtures');

test('should list all Markdown files with default config', async () => {
  const expected = ['a.md', 'slides.md', 'sub/c.md', 'sub/slides.md'];
  const actual = getFilePaths(FIXTURES_DIR, getFilesGlob());
  assert.deepEqual(expected.sort(), actual.sort());
});

test('should list only files matching the glob pattern', async () => {
  const expected = ['slides.md', 'sub/slides.md'];
  const actual = getFilePaths(FIXTURES_DIR, '**/slides.md');
  assert.deepEqual(expected.sort(), actual.sort());
});
