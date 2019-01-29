const expect = require('expect');
const { render, slidify } = require('../lib/render');

describe('render', () => {
  it('should render basic template', async () => {
    const actual = await render('', {});
    expect(actual).toContain('<title>reveal-md</title>');
    expect(actual).toContain('<link rel="stylesheet" href="/css/theme/black.css"');
    expect(actual).toContain('<link rel="stylesheet" href="/css/highlight/zenburn.css"');
    expect(actual).toContain('<link rel="stylesheet" href="/css/print/paper.css" type="text/css" media="print" />');
    expect(actual).toContain(
      '<div class="slides"><section  data-markdown><script type="text/template"></script></section></div>'
    );
    expect(actual).toContain('<script src="/js/reveal.js"></script>');
    expect(actual).toContain("{ src: '/plugin/markdown/markdown.js'");
    expect(actual).toContain('var options = extend(defaultOptions, {}, queryOptions);');
  });

  it('should render markdown content', async () => {
    const actual = await render('# header', {});
    expect(actual).toContain(
      '<div class="slides"><section  data-markdown><script type="text/template"># header</script></section></div>'
    );
  });

  it('should render custom scripts', async () => {
    const actual = await render('# header', { scripts: 'custom.js,also.js' });
    expect(actual).toContain('<script src="/_assets/custom.js"></script>');
    expect(actual).toContain('<script src="/_assets/also.js"></script>');
  });

  it('should render custom css after theme', async () => {
    const actual = await render('# header', { css: 'style1.css,style2.css' });
    const themeLink = '<link rel="stylesheet" href="/css/highlight/zenburn.css" />';
    const style1Link = '<link rel="stylesheet" href="/_assets/style1.css" />';
    const style2Link = '<link rel="stylesheet" href="/_assets/style2.css" />';
    expect(actual).toContain(themeLink);
    expect(actual).toContain(style1Link);
    expect(actual).toContain(style2Link);
    expect(actual.indexOf(style1Link)).toBeGreaterThan(actual.indexOf(themeLink));
    expect(actual.indexOf(style2Link)).toBeGreaterThan(actual.indexOf(style1Link));
  });

  it('should render print stylesheet', async () => {
    const actual = await render('', { print: true });
    expect(actual).toContain('<link rel="stylesheet" href="/css/print/pdf.css" type="text/css" media="print" />');
  });

  it('should render alternate theme stylesheet', async () => {
    const actual = await render('', { theme: 'white' });
    expect(actual).toContain('<link rel="stylesheet" href="/css/theme/white.css"');
  });

  it('should render root-based domain-less links for static markup', async () => {
    const actual = await render('', { static: true, base: '.' });
    expect(actual.match(/href="\.\//g).length).toBe(4);
    expect(actual.match(/src="\.\//g).length).toBe(2);
    expect(actual.match(/src:\ '\.\//g).length).toBe(7);
  });

  it('should render reveal.js options', async () => {
    const actual = await render('', { revealOptions: { controls: false } });
    expect(actual).toContain('var options = extend(defaultOptions, {"controls":false}, queryOptions);');
  });

  it('should render title from YAML front matter', async () => {
    const actual = await render('---\ntitle: Foo Bar\n---\nSlide', {});
    expect(actual).toMatch(/<title>Foo Bar<\/title>/);
  });

  it('should parse YAML front matter', async () => {
    const actual = await render('---\nseparator: <!--s-->\n---\nSlide A<!--s-->Slide B');
    expect(actual).toContain(
      '' +
        '<section  data-markdown><script type="text/template">\nSlide A</script></section>' +
        '<section  data-markdown><script type="text/template">Slide B</script></section>'
    );
  });

  it('should render OpenGraph metadata', async () => {
    const actual = await render('', { absoluteUrl: 'http://example.com', title: 'Foo Bar' });
    expect(actual).toContain('<meta property="og:title" content="Foo Bar" />');
    expect(actual).toContain('<meta property="og:image" content="http://example.com/featured-slide.jpg" />');
  });

  it('should use preprocesser for markdown', async () => {
    const actual = await render('# Slide A\n\ncontent\n\n# Slide B\n\ncontent', { preprocessor: 'test/preproc' });
    expect(actual).toContain(
      '' +
        '<section  data-markdown><script type="text/template"># Slide A\n\ncontent\n\n</script></section>' +
        '<section  data-markdown><script type="text/template">\n# Slide B\n\ncontent</script></section>'
    );
  });

  it('should merge revealOptions from front matter and local options', async () => {
    const revealOptions = { height: 100, transition: 'none' };
    const actual = await render('---\nrevealOptions:\n  width: 300\n  height: 500\n---\nSlide', { revealOptions });
    const expected = JSON.stringify(Object.assign({}, revealOptions, { width: 300, height: 500 }));
    expect(actual).toContain(`var options = extend(defaultOptions, ${expected}, queryOptions);`);
  });
});

describe('slidify', () => {
  it('should render slides split by horizontal separator', () => {
    const actual = slidify('Slide A\n\n---\n\nSlide B');
    expect(actual).toEqual(
      '' +
        '<section  data-markdown><script type="text/template">Slide A\n</script></section>' +
        '<section  data-markdown><script type="text/template">\nSlide B</script></section>'
    );
  });

  it('should render sub slides split by vertical separator', () => {
    const actual = slidify('Slide A\n\n---\n\nSlide B\n\n----\n\nSlide C');
    expect(actual).toEqual(
      '' +
        '<section  data-markdown><script type="text/template">Slide A\n</script></section>' +
        '<section >' +
        '<section data-markdown><script type="text/template">\nSlide B\n</script></section>' +
        '<section data-markdown><script type="text/template">\nSlide C</script></section>' +
        '</section>'
    );
  });

  it('should render slides split by custom separators', () => {
    const actual = slidify('Slide A\n\n\nSlide B\n\nSlide C', { separator: '\n\n\n', verticalSeparator: '\n\n' });
    expect(actual).toEqual(
      '' +
        '<section  data-markdown><script type="text/template">Slide A</script></section>' +
        '<section >' +
        '<section data-markdown><script type="text/template">Slide B</script></section>' +
        '<section data-markdown><script type="text/template">Slide C</script></section>' +
        '</section>'
    );
  });

  it('should render speaker notes', () => {
    const actual = slidify('Slide A\n\nNote: test');
    expect(actual).toEqual(
      '<section  data-markdown><script type="text/template">Slide A\n\n<aside class="notes"><p>test</p>\n</aside></script></section>'
    );
  });

  it('should ignore comments (e.g. custom slide attributes)', () => {
    const actual = slidify('Slide A\n\n---\n\n<!-- .slide: data-background="./image1.png" -->\nSlide B');
    expect(actual).toEqual(
      '' +
        '<section  data-markdown><script type="text/template">Slide A\n</script></section>' +
        '<section  data-markdown><script type="text/template">\n<!-- .slide: data-background="./image1.png" -->\nSlide B</script></section>'
    );
  });
});
