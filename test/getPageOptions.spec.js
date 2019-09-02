const test = require('bron');
const assert = require('assert').strict;
const { getPageOptions } = require('../lib/config');

test('should handle dimensions without units', () => {
  const actual = getPageOptions('1024x768');
  assert(actual.width === '1024');
  assert(actual.height === '768');
});

test('should handle dimensions with units', () => {
  const actual = getPageOptions('210x297mm');
  assert(actual.width === '210mm');
  assert(actual.height === '297mm');
});

test('should handle fractional dimensions', () => {
  const actual = getPageOptions('8.5x11in');
  assert(actual.width === '8.5in');
  assert(actual.height === '11in');
});

test('should handle format name', () => {
  const actual = getPageOptions('Letter');
  assert(actual.format === 'Letter');
});
