const test = require('bron');
const assert = require('assert').strict;
const { join } = require('path');
const { listFiles } = require('../lib/util');
const { getFilesGlob } = require('../lib/config');

const FIXTURES_DIR = join(__dirname, 'fixtures');

test('listFiles should list all MD files with default config', async () => {
  const expected = ['a.md', 'slides.md', 'sub/c.md', 'sub/slides.md'];
  const actual = listFiles(FIXTURES_DIR, getFilesGlob());
  assert.deepEqual(expected, actual);
});

test('listFiles should list only files matching the glob', async () => {
  const expected = ['slides.md', 'sub/slides.md'];
  const actual = listFiles(FIXTURES_DIR, '**/slides.md');
  assert.deepEqual(expected, actual);
});
