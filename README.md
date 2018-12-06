# reveal-md

[reveal.js](http://lab.hakim.se/reveal-js/#/) on steroids! Get beautiful reveal.js presentations from Markdown files.

## Installation

```bash
npm install -g reveal-md
```

## Usage

```bash
reveal-md path/to/my/slides.md
```

This starts a local server and opens any Markdown file as a reveal.js presentation in the default browser.
Remote resources are also possible:

```bash
reveal-md https://raw.githubusercontent.com/webpro/reveal-md/master/demo/a.md
```

## Features

- [Markdown](#markdown)
- [Theme](#theme)
- [Highlight Theme](#highlight-theme)
- [Custom Slide Separators](#custom-slide-separators)
- [Custom Slide Attributes](#custom-slide-attributes)
- [reveal-md Options](#reveal-md-options)
- [Reveal.js Options](#revealjs-options)
- [Speaker Notes](#speaker-notes)
- [YAML Front Matter](#yaml-front-matter)
- [Live Reload](#live-reload)
- [Custom Scripts](#custom-scripts)
- [Custom CSS](#custom-css)
- [Pre-process Markdown](#pre-process-markdown)
- [Print to PDF](#print-to-pdf)
- [Static Website](#static-website)
- [Disable Auto-open Browser](#disable-auto-open-browser)
- [Directory Listing](#directory-listing)
- [Custom Port](#custom-port)
- [Custom Template](#custom-template)

### Markdown

The Markdown feature of reveal.js is awesome, and has an easy (and configurable) syntax to separate slides.
Use three dashes surrounded by two blank lines (`\n---\n`). Example:

```text
# Title

* Point 1
* Point 2

---

## Second slide

> Best quote ever.

Note: speaker notes FTW!
```

### Theme

Override theme (default: `black`):

```bash
reveal-md slides.md --theme solarized
```

See [available themes](https://github.com/hakimel/reveal.js/tree/master/css/theme).

Override reveal theme with a custom one. In this example, the file is at `./theme/my-custom.css`:

```bash
reveal-md slides.md --theme theme/my-custom.css
```

Override reveal theme with a remote one (use rawgit.com because the url must allow cross-site access):

```bash
reveal-md slides.md --theme https://rawgit.com/puzzle/pitc-revealjs-theme/master/theme/puzzle.css
```

### Highlight Theme

Override highlight theme (default: `zenburn`):

```bash
reveal-md slides.md --highlight-theme github
```

See [available themes](https://github.com/isagalaev/highlight.js/tree/master/src/styles).

### Custom Slide Separators

Override slide separator (default: `\n---\n`):

```bash
reveal-md slides.md --separator "^\n\n\n"
```

Override vertical/nested slide separator (default: `\n----\n`):

```bash
reveal-md slides.md --vertical-separator "^\n\n"
```

### Custom Slide Attributes

Use the [reveal.js slide attributes](https://github.com/hakimel/reveal.js#slide-attributes) functionality
to add HTML attributes, e.g. custom backgrounds.
Alternatively, add an HTML `id` attribute to a specific slide and style it with CSS.

Example: set the second slide to have a PNG image as background:

```text
# slide1

This slide has no background image.

---

<!-- .slide: data-background="./image1.png" -->
# slide2

This one does!
```

### reveal-md Options

Define options similar to command-line options in a `reveal-md.json` file that must be located at the root of
the Markdown files. They'll be picked up automatically. Example:

```json
{
  "separator": "^\n\n\n",
  "verticalSeparator": "^\n\n"
}
```

### Reveal.js Options

Define Reveal.js [options](https://github.com/hakimel/reveal.js#configuration) in a `reveal.json` file
that must be located at the root directory of the Markdown files. They'll be picked up automatically. Example:

```json
{
  "controls": true,
  "progress": true
}
```

### Speaker Notes

Use the [speaker notes](https://github.com/hakimel/reveal.js#speaker-notes) feature by using a line starting with `Note:`.

### YAML Front matter

Set Markdown (and reveal.js) options specific to a presentation with YAML front matter:

```
---
title: Foobar
separator: <!--s-->
verticalSeparator: <!--v-->
theme: solarized
revealOptions:
    transition: 'fade'
---
Foo

Note: test note

<!--s-->

# Bar

<!--v-->
```

### Live Reload

Using `-w` option changes to markdown files will trigger the browser to
reload and thus display the changed presentation without the user having
to reload the browser.

### Custom Scripts

Inject custom scripts into the page:

```bash
reveal-md slides.md --scripts script.js,another-script.js
```

### Custom CSS

Inject custom CSS into the page:

```bash
reveal-md slides.md --css style.css,another-style.css
```

### Pre-process Markdown

`reveal-md` can be given a markdown preprocessor script via the `--preprocessor` (or
`-P`) option. This can be useful to implement custom tweaks on the document
format without having to dive into the guts of the Markdown parser.

For example, to have headers automatically create new slides, one could have
the script `preproc.js`:

```javascript
// headings trigger a new slide
// headings with a caret (e.g., '##^ foo`) trigger a new vertical slide
module.exports = (markdown, options) => {
  return new Promise((resolve, reject) => {
    return resolve(
      markdown
        .split('\n')
        .map((line, index) => {
          if (!/^#/.test(line) || index === 0) return line;
          const is_vertical = /#\^/.test(line);
          return (is_vertical ? '\n----\n\n' : '\n---\n\n') + line.replace('#^', '#');
        })
        .join('\n')
    );
  });
};
```

and use it like this

```bash
$ reveal-md --preprocessor preproc.js slides.md
```

### Print to PDF

Create a (printable) PDF from the provided Markdown file:

```bash
reveal-md slides.md --print slides.pdf
```

Alternatively, append `?print-pdf` to the url from the command-line or in the browser
(make sure to remove the `#/` or `#/1` hash).
Then print the slides using the browser's (not the native) print dialog. This seems to work in Chrome.

### Static Website

This will export the provided Markdown file into a stand-alone HTML website including scripts and stylesheets.
The files are saved to the directory passed to the `--static` parameter (default: `./_static`):

```bash
reveal-md slides.md --static _site
```

Use `--static-dirs` to copy directories with static assets to the target directory.
Use a comma-separated list to copy multiple directories.

```bash
reveal-md slides.md --static --static-dirs=assets
```

Providing a directory will result in a stand-alone overview page with links to the presentations
(similar to a [directory listing](#directory-listing)):

```bash
reveal-md dir/ --static
```

Additional `--absolute-url` and `--featured-slide` parameters could be used to
generate [OpenGraph](http://ogp.me) metadata enabling more attractive rendering
for slide deck links when shared in some social sites.

```bash
reveal-md slides.md --static _site --absolute-url https://example.com --featured-slide 5
```

### Disable Auto-open Browser

To disable auto-opening the browser:

```bash
reveal-md slides.md --disable-auto-open
```

### Directory Listing

Show (recursive) directory listing of Markdown files:

```bash
reveal-md dir/
```

Show directory listing of Markdown files in current directory:

```bash
reveal-md
```

### Custom Port

Override port (default: `1948`):

```bash
reveal-md slides.md --port 8888
```

### Custom Template

Override reveal.js HTML template ([default template](https://github.com/webpro/reveal-md/blob/master/lib/template/reveal.html)):

```bash
reveal-md slides.md --template my-reveal-template.html
```

Override listing HTML template ([default template](https://github.com/webpro/reveal-md/blob/master/lib/template/listing.html)):

```bash
reveal-md slides.md --listing-template my-listing-template.html
```

## Related Projects & Alternatives

- [Slides](https://slides.com/) is a place for creating, presenting and sharing slide decks.
- [Sandstorm Hacker Slides](https://github.com/jacksingleton/hacker-slides) is a simple app that combines Ace Editor and RevealJS.
- [Tools](https://github.com/hakimel/reveal.js/wiki/Plugins,-Tools-and-Hardware#tools) in the Plugins, Tools and Hardware section of Reveal.js.
- [Org-Reveal](https://github.com/yjwen/org-reveal) exports Org-mode contents to Reveal.js HTML presentation.
- [DeckTape](https://github.com/astefanutti/decktape) is a high-quality PDF exporter for HTML5 presentation frameworks.
- [GitPitch](https://gitpitch.com) generates slideshows from PITCHME.md found in hosted Git repos.

## Thank You

Many thanks to all [contributors](https://github.com/webpro/reveal-md/graphs/contributors)!

## License

[MIT](http://webpro.mit-license.org)
