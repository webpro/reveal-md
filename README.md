# reveal-md

[reveal.js](http://lab.hakim.se/reveal-js/#/) on steroids! Get beautiful reveal.js presentations from your Markdown files.

## Installation

``` bash
npm install -g reveal-md
```

## Usage

``` bash
reveal-md path/to/my/slides.md
```

This starts a local server and opens your Markdown file as a reveal.js presentation in the default browser. Remote resources are also possible:

``` bash
reveal-md https://raw.githubusercontent.com/webpro/reveal-md/master/demo/a.md
```

## Quick demo

Get a quick preview with a few demo decks:

``` bash
reveal-md demo
```

## Features

* Markdown
* Theme
* Highlight Theme
* Custom Slide Separators
* Custom Slide Attributes
* reveal-md Options
* Reveal.js Options
* Speaker Notes
* YAML Front Matter
* Live Reload
* Custom Scripts
* Custom CSS
* Pre-process Markdown
* Print to PDF
* Static Website
* Disable Auto-open Browser
* Directory Listing
* Custom Port

### Markdown

The Markdown feature of reveal.js is awesome, and has an easy (and configurable) syntax to separate slides. Use three dashes surrounded by two blank lines (`\n---\n`). Example:

``` text
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

``` bash
reveal-md slides.md --theme solarized
```

See [available themes](https://github.com/hakimel/reveal.js/tree/master/css/theme).

Override reveal theme with a custom one. In this example, the file must be at `./theme/my-custom.css`:

``` bash
reveal-md slides.md --theme my-custom
```

Override reveal theme with a remote one (use rawgit.com because the url must allow cross-site access):

``` bash
reveal-md slides.md --theme https://rawgit.com/puzzle/pitc-revealjs-theme/master/theme/puzzle.css
```

### Highlight Theme

Override highlight theme (default: `zenburn`):

``` bash
reveal-md slides.md --highlight-theme github
```

See [available themes](https://github.com/isagalaev/highlight.js/tree/master/src/styles).

### Custom Slide Separators

Override slide separator (default: `\n---\n`):

``` bash
reveal-md slides.md --separator "^\n\n\n"
```

Override vertical/nested slide separator (default: `\n----\n`):

``` bash
reveal-md slides.md --vertical-separator "^\n\n"
```

### Custom Slide Attributes

You can use the [reveal.js slide attributes](https://github.com/hakimel/reveal.js#slide-attributes) functionality to add HTML attributes, e.g. custom backgrounds. Alternatively you could add an HTML `id` attribute to a specific slide and style it with your own CSS.

If you want yor second slide to have a png background:

``` text
# slide1

This slide has no background image.

---

<!-- .slide: data-background="./image1.png" -->
# slide2

This one does!
```

### reveal-md Options

You can define options similar to command-line options in a `reveal-md.json` file that you should put in the root directory of the Markdown files. They'll be picked up automatically. Example:

``` json
{
  "separator": "^\n\n\n",
  "verticalSeparator": "^\n\n"
}
```

### Reveal.js Options

You can define Reveal.js [options](https://github.com/hakimel/reveal.js#configuration) in a `reveal.json` file that you should put in the root directory of the Markdown files. They'll be picked up automatically. Example:

``` json
{
  "controls": true,
  "progress": true
}
```

### Speaker Notes

You can use the [speaker notes](https://github.com/hakimel/reveal.js#speaker-notes) feature by using a line starting with `Note:`.

### YAML Front matter

You can set markdown options and revealoptions specific to your pressentation in the .md file with YAML
front matter header Jekyll style.

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

``` bash
reveal-md slides.md --scripts script.js,another-script.js
```

### Custom CSS

Inject custom CSS into the page:

``` bash
reveal-md slides.md --css style.css,another-style.css
```

### Pre-process Markdown

`reveal-md` can be given a markdown preprocessor script via the `--preprocessor` (or
`-P`) option. This can be useful to implement custom tweaks on the document
format without having to dive into the guys of the Markdown parser.

For example, to have headers automatically create new slides, one could have
the script `preproc.js`:

```javascript
// headings trigger a new slide
// headings with a caret (e.g., '##^ foo`) trigger a new vertical slide
module.exports = (markdown, options) => {
  return markdown.split('\n').map((line, index) => {
    if(!/^#/.test(line) || index === 0) return line;
    const is_vertical = /#\^/.test(line);
    return (is_vertical ? '\n----\n\n' : '\n---\n\n') + line.replace('#^', '#');
  }).join('\n');
};
```

and use it like this

```bash
$ reveal-md --preprocessor preproc.js slides.md
```

### Print to PDF

*Requires phantomjs to be installed (preferably globally)*

This will create a PDF from the provided Markdown file and saves a PDF file:

``` bash
reveal-md slides.md --print slides.pdf
```

### Static Website

This will produce a standalone version of the passed file in HTML including static scripts and stylesheets.
The files are saved to the directory passed to the `--static` parameter, or `./_static` if not provided:

```bash
reveal-md slides.md --static _site
```

### Disable Auto-open Browser

Disable to automatically open your web browser:

``` bash
reveal-md slides.md --disable-auto-open
```

### Directory Listing

Show (recursive) directory listing of Markdown files:

``` bash
reveal-md dir/
```

Show directory listing of Markdown files in current directory:

``` bash
reveal-md
```

### Custom Port

Override port (default: `1948`):

``` bash
reveal-md slides.md --port 8888
```

## Related Projects & Alternatives

* [Slides](https://slides.com/) is a place for creating, presenting and sharing slide decks.
* [Sandstorm Hacker Slides](https://github.com/jacksingleton/hacker-slides) is a simple app that combines Ace Editor and RevealJS.
* [Tools](https://github.com/hakimel/reveal.js/wiki/Plugins,-Tools-and-Hardware#tools) in the Plugins, Tools and Hardware section of Reveal.js.
* [Org-Reveal](https://github.com/yjwen/org-reveal) exports Org-mode contents to Reveal.js HTML presentation.
* [DeckTape](https://github.com/astefanutti/decktape) is a high-quality PDF exporter for HTML5 presentation frameworks.

## License

[MIT](http://webpro.mit-license.org)
