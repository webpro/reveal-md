const expect = require('expect');
const fs = require('fs');
const render = require('../lib/render');

const markdown = fs.readFileSync('demo/a.md').toString();

describe('render', () => {

  it('should render basic template', () => {
    return render.render('', {}).then(actual => {
      expect(actual).toContain('<title>reveal-md</title>');
      expect(actual).toContain('<link rel="stylesheet" href="/css/theme/black.css"');
      expect(actual).toContain('<link rel="stylesheet" href="/css/highlight/zenburn.css"');
      expect(actual).toContain('<link rel="stylesheet" href="/css/print/paper.css" type="text/css" media="print">');
      expect(actual).toContain('<div class="slides"><section  data-markdown><script type="text/template"></script></section></div>');
      expect(actual).toContain('<script src="/js/reveal.js"></script>');
      expect(actual).toContain('{ src: \'/plugin/markdown/markdown.js\'');
      expect(actual).toContain('var options = {};');
    });
  });

  it('should render markdown content', () => {
    return render.render('# header', {}).then(actual => {
      expect(actual).toContain('<div class="slides"><section  data-markdown><script type="text/template"># header</script></section></div>');
    });
  });

  it('should render custom scripts', () => {
    return render.render('# header', { scripts: 'custom.js,also.js' }).then(actual => {
      expect(actual).toContain('<script src="/_assets/custom.js"></script>');
      expect(actual).toContain('<script src="/_assets/also.js"></script>');
    });
  });

  it('should render custom css after theme', () => {
    return render.render('# header', { css: 'style1.css,style2.css' }).then(actual => {
      const themeLink = '<link rel="stylesheet" href="/css/highlight/zenburn.css">';
      const style1Link = '<link rel="stylesheet" href="/_assets/style1.css">';
      const style2Link = '<link rel="stylesheet" href="/_assets/style2.css">';
      expect(actual).toContain(themeLink);
      expect(actual).toContain(style1Link);
      expect(actual).toContain(style2Link);
      expect(actual.indexOf(style1Link)).toBeGreaterThan(actual.indexOf(themeLink));
      expect(actual.indexOf(style2Link)).toBeGreaterThan(actual.indexOf(style1Link));
    });
  });

  it('should render print stylesheet', () => {
    return render.render('', { print: true }).then(actual => {
      expect(actual).toContain('<link rel="stylesheet" href="/css/print/pdf.css" type="text/css" media="print">');
    });
  });

  it('should render alternate theme stylesheet', () => {
    return render.render('', { theme: 'white' }).then(actual => {
      expect(actual).toContain('<link rel="stylesheet" href="/css/theme/white.css"');
    });
  });

  it('should render root-based domain-less links for static markup', () => {
    return render.render('', { static: true }).then(actual => {
      expect(actual.match(/href="\.\//g).length).toBe(4);
      expect(actual.match(/src="\.\//g).length).toBe(2);
      expect(actual.match(/src:\ '\.\//g).length).toBe(7);
    });
  });

  it('should render reveal.js options', () => {
    return render.render('', { revealOptions: { controls: false } }).then(actual => {
      expect(actual).toContain('var options = {"controls":false};');
    });
  });

  it('should render title from YAML front matter', () => {
    return render.render('---\ntitle: Foo Bar\n---\nSlide', {}).then(actual => {
      expect(actual).toMatch(/<title>Foo Bar<\/title>/);
    });
  });
});

describe('parseSlides', () => {

  it('should render slides split by horizontal separator', () => {
    render.parseSlides('Slide A\n\n---\n\nSlide B', {}).then(actual => {
      expect(actual.slides).toEqual('' +
        '<section  data-markdown><script type="text/template">Slide A\n</script></section>' +
        '<section  data-markdown><script type="text/template">\nSlide B</script></section>');
    });
  });

  it('should render sub slides split by vertical separator', () => {
    render.parseSlides('Slide A\n\n---\n\nSlide B\n\n----\n\nSlide C', {}).then(actual => {
      expect(actual.slides).toEqual('' +
        '<section  data-markdown><script type="text/template">Slide A\n</script></section>' +
        '<section >' +
        '<section data-markdown><script type="text/template">\nSlide B\n</script></section>' +
        '<section data-markdown><script type="text/template">\nSlide C</script></section>' +
        '</section>');
    });
  });

  it('should render slides split by custom separators', () => {
    render.parseSlides('Slide A\n\n\nSlide B\n\nSlide C', { separator: '\n\n\n', verticalSeparator: '\n\n' }).then(actual => {
      expect(actual.slides).toEqual('' +
        '<section  data-markdown><script type="text/template">Slide A</script></section>' +
        '<section >' +
        '<section data-markdown><script type="text/template">Slide B</script></section>' +
        '<section data-markdown><script type="text/template">Slide C</script></section>' +
        '</section>');
    });
  });

  it('should render speaker notes', () => {
    render.parseSlides('Slide A\n\nNote: test', {}).then(actual => {
      expect(actual.slides).toEqual('<section  data-markdown><script type="text/template">Slide A\n\n<aside class="notes"><p>test</p>\n</aside></script></section>');
    });
  });

  it('should parse YAML front matter', () => {
    render.parseSlides('---\nseparator: <!--s-->\n---\nSlide A<!--s-->Slide B', {}).then(actual => {
      expect(actual.slides).toEqual('' +
        '<section  data-markdown><script type="text/template">\nSlide A</script></section>' +
        '<section  data-markdown><script type="text/template">Slide B</script></section>');
    });
  });

  it('should ignore comments (e.g. custom slide attributes)', () => {
    render.parseSlides('Slide A\n\n---\n\n<!-- .slide: data-background="./image1.png" -->\nSlide B', {}).then(actual => {
      expect(actual.slides).toEqual('' +
        '<section  data-markdown><script type="text/template">Slide A\n</script></section>' +
        '<section  data-markdown><script type="text/template">\n<!-- .slide: data-background="./image1.png" -->\nSlide B</script></section>');
    });
  });

  it('should use preprocesser for markdown', () => {
    render.parseSlides('# Slide A\n\ncontent\n\n# Slide B\n\ncontent', { preprocessor: 'test/preproc' }).then(actual => {
      expect(actual.slides).toEqual('' +
        '<section  data-markdown><script type="text/template"># Slide A\n\ncontent\n\n</script></section>' +
        '<section  data-markdown><script type="text/template">\n# Slide B\n\ncontent</script></section>');
    });
  });

});
