import test from 'node:test';
import { strict as assert } from 'assert';
import { render } from '../lib/render.js';

test('should render basic template', async () => {
  const actual = await render('', {});
  assert(actual.includes('<title>reveal-md</title>'));
  assert(actual.includes('<link rel="stylesheet" href="/dist/theme/black.css"'));
  assert(actual.includes('<link rel="stylesheet" href="/css/highlight/base16/zenburn.css"'));
  assert(
    /<section data-markdown data-separator="\\r\?\\n---\\r\?\\n" data-separator-vertical="\\r\?\\n----\\r\?\\n">\s*<textarea data-template>\s*<\/textarea>\s*<\/section>/.test(
      actual
    )
  );
  assert(actual.includes('<script src="/dist/reveal.js"></script>'));
  assert(actual.includes('<script src="/plugin/markdown/markdown.js"></script>'));
  assert(actual.includes('var options = extend(defaultOptions, {"_":[]}, queryOptions);'));
});

test('should render markdown content', async () => {
  const actual = await render('# header', {});
  assert(/<section data-markdown.*?>\s*<textarea data-template>\s*# header\s*<\/textarea>\s*<\/section>/.test(actual));
});

test('should render custom scripts', async () => {
  const actual = await render('# header', { scripts: 'custom.js,also.js,http://example.org/script.js', base: '.' });
  assert(actual.includes('<script src="./_assets/custom.js"></script>'));
  assert(actual.includes('<script src="./_assets/also.js"></script>'));
  assert(actual.includes('<script src="http://example.org/script.js"></script>'));
});

test('should render custom css, after theme', async () => {
  const actual = await render('# header', { css: 'style1.css,style2.css,http://example.org/style.css' });
  const themeLink = '<link rel="stylesheet" href="/css/highlight/base16/zenburn.css" />';
  const style1Link = '<link rel="stylesheet" href="/_assets/style1.css" />';
  const style2Link = '<link rel="stylesheet" href="/_assets/style2.css" />';
  const style3Link = '<link rel="stylesheet" href="http://example.org/style.css" />';
  assert(actual.includes(themeLink));
  assert(actual.includes(style1Link));
  assert(actual.includes(style2Link));
  assert(actual.includes(style3Link));
  assert(actual.indexOf(style1Link) > actual.indexOf(themeLink));
  assert(actual.indexOf(style2Link) > actual.indexOf(style1Link));
});

test('should render alternate theme stylesheet', async () => {
  const actual = await render('', { theme: 'white' });
  assert(actual.includes('<link rel="stylesheet" href="/dist/theme/white.css"'));
});

test('should render remote theme stylesheet', async () => {
  const actual = await render('', { theme: 'https://example.org/style.css' });
  assert(actual.includes('<link rel="stylesheet" href="https://example.org/style.css"'));
});

test('should render root-based domain-less links for static markup', async () => {
  const actual = await render('', { static: true, base: '.' });
  assert.equal(actual.match(/href="\.\//g).length, 5);
  assert.equal(actual.match(/src="\.\//g).length, 7);
});

test('should render reveal.js options', async () => {
  const actual = await render('', { revealOptions: { controls: false } });
  assert(actual.includes('var options = extend(defaultOptions, {"controls":false,"_":[]}, queryOptions);'));
});

test('should render title from YAML front matter', async () => {
  const actual = await render('---\ntitle: Foo Bar\n---\nSlide', {});
  assert(actual.match(/<title>Foo Bar<\/title>/));
});

test('should parse YAML front matter', async () => {
  const actual = await render('---\nseparator: <!--s-->\n---\nSlide A<!--s-->Slide B');
  assert(
    /<section data-markdown data-separator="<!--s-->" .*?>\s*<textarea data-template>\s*Slide A<!--s-->Slide B\s*<\/textarea>\s*<\/section>/.test(
      actual
    )
  );
});

test('should render OpenGraph metadata', async () => {
  const actual = await render('', { absoluteUrl: 'http://example.com', title: 'Foo Bar' });
  assert(actual.includes('<meta property="og:title" content="Foo Bar" />'));
  assert(actual.includes('<meta property="og:image" content="http://example.com/featured-slide.jpg" />'));
});

test('should use preprocesser for markdown', async () => {
  const actual = await render('# Slide A\n\ncontent\n\n# Slide B\n\ncontent', { preprocessor: '../test/preproc.js' });
  assert(
    /<section data-markdown.*?>\s*<textarea data-template>\s*# Slide A\s+content\s+---\s+# Slide B\s*content\s*<\/textarea>\s*<\/section>/.test(
      actual
    )
  );
});

test('should merge revealOptions from front matter and local options', async () => {
  const revealOptions = { height: 100, transition: 'none' };
  const actual = await render('---\nrevealOptions:\n  width: 300\n  height: 500\n---\nSlide', { revealOptions });
  const expected = JSON.stringify(Object.assign({}, revealOptions, { _: [] }, { width: 300, height: 500 }));
  assert(actual.includes(`var options = extend(defaultOptions, ${expected}, queryOptions);`));
});

test('should render correct favicon', async () => {
  const actual = await render('', { static: true, base: '.' });
  assert(actual.includes(`<link rel="shortcut icon" href="./favicon.ico" />`));
});
