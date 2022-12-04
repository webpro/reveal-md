const test = require('bron');
const assert = require('assert').strict;
const { slidify } = require('../lib/render');

test('should render slides split by horizontal separator', () => {
  const actual = slidify('Slide A\n\n---\n\nSlide B');
  assert.equal(
    actual,
    '<section  data-markdown><script type="text/template">Slide A\n</script></section>' +
      '<section  data-markdown><script type="text/template">\nSlide B</script></section>'
  );
});

test('should render sub slides split by vertical separator', () => {
  const actual = slidify('Slide A\n\n---\n\nSlide B\n\n----\n\nSlide C');
  assert.equal(
    actual,
    '<section  data-markdown><script type="text/template">Slide A\n</script></section>' +
      '<section >' +
      '<section data-markdown><script type="text/template">\nSlide B\n</script></section>' +
      '<section data-markdown><script type="text/template">\nSlide C</script></section>' +
      '</section>'
  );
});

test('should render slides split by custom separators', () => {
  const actual = slidify('Slide A\n\n\nSlide B\n\nSlide C', { separator: '\n\n\n', verticalSeparator: '\n\n' });
  assert.equal(
    actual,
    '<section  data-markdown><script type="text/template">Slide A</script></section>' +
      '<section >' +
      '<section data-markdown><script type="text/template">Slide B</script></section>' +
      '<section data-markdown><script type="text/template">Slide C</script></section>' +
      '</section>'
  );
});

test('should render speaker notes', () => {
  const actual = slidify('Slide A\n\nNote: test');
  assert.equal(
    actual,
    '<section  data-markdown>' +
      '<script type="text/template">Slide A\n\n<aside class="notes"><p>test</p>\n</aside></script></section>'
  );
});

test('should ignore comments (e.g. custom slide attributes)', () => {
  const actual = slidify('Slide A\n\n---\n\n<!-- .slide: data-background="./image1.png" -->\nSlide B');
  assert.equal(
    actual,
    '<section  data-markdown><script type="text/template">Slide A\n</script></section>' +
      '<section  data-markdown><script type="text/template">\n<!-- .slide: data-background="./image1.png" -->\nSlide B</script></section>'
  );
});
