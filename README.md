# reveal-md

[reveal.js][1] on steroids! Get beautiful reveal.js presentations from Markdown files.

## Installation

```console
npm install -g reveal-md
```

## Usage

```console
reveal-md slides.md
```

This starts a local server and opens any Markdown file as a reveal.js presentation in the default browser.

## Docker

You can use Docker to run this tool without needing Node.js installed on your machine. Run the public Docker image,
providing your markdown slides as a volume. A few examples:

```console
docker run --rm -p 1948:1948 -v <path-to-your-slides>:/slides webpronl/reveal-md:latest
docker run --rm -p 1948:1948 -v <path-to-your-slides>:/slides webpronl/reveal-md:latest --help
```

The service is now running at [http://localhost:1948][2].

To enable live reload in the container, port 35729 should be mapped as well:

```console
docker run --rm -p 1948:1948 -p 35729:35729 -v <path-to-your-slides>:/slides webpronl/reveal-md:latest /slides --watch
```

## Features

- [Installation][3]
- [Usage][4]
- [Docker][6]
- [Features][7]
  - [Markdown][8]
    - [Code Section][59]
  - [Theme][9]
  - [Highlight Theme][10]
  - [Custom Slide Separators][11]
  - [Custom Slide Attributes][12]
  - [reveal-md Options][13]
  - [Reveal.js Options][14]
  - [Speaker Notes][15]
  - [YAML Front matter][16]
  - [Live Reload][17]
  - [Custom Scripts][18]
  - [Custom CSS][19]
  - [Custom Favicon][20]
  - [Pre-process Markdown][21]
  - [Print to PDF][22]
    - [1. Using Puppeteer][23]
    - [2. Using Docker & DeckTape][24]
  - [Static Website][25]
  - [Disable Auto-open Browser][26]
  - [Directory Listing][27]
  - [Custom Port][28]
  - [Custom Template][29]
- [Scripts, Preprocessors and Plugins][30]
- [Related Projects & Alternatives][31]
- [Thank You][32]
- [License][33]

### Markdown

The Markdown feature of reveal.js is awesome, and has an easy (and configurable) syntax to separate slides. Use three
dashes surrounded by two blank lines (`\n---\n`). Example:

```markdown
# Title

- Point 1
- Point 2

---

## Second slide

> Best quote ever.

Note: speaker notes FTW!
```

#### Code section

##### Syntax highlighting

````markdown
```js
console.log('Hello world!');
```
````

##### Highlight some lines

You can highlight one line, multiple lines or both.

````markdown
```python [1|3-6]
n = 0
while n < 10:
  if n % 2 == 0:
    print(f"{n} is even")
  else:
    print(f"{n} is odd")
  n += 1
```
````

### Theme

Override theme (default: `black`):

```console
reveal-md slides.md --theme solarized
```

See [available themes][34].

Override reveal theme with a custom one. In this example, the file is at `./theme/my-custom.css`:

```console
reveal-md slides.md --theme theme/my-custom.css
```

Override reveal theme with a remote one (use rawgit.com because the url must allow cross-site access):

```console
reveal-md slides.md --theme https://rawgit.com/puzzle/pitc-revealjs-theme/master/theme/puzzle.css
```

### Highlight Theme

Override highlight theme (default: `zenburn`):

```console
reveal-md slides.md --highlight-theme github
```

See [available themes][35].

### Custom Slide Separators

Override slide separator (default: `\n---\n`):

```console
reveal-md slides.md --separator "^\n\n\n"
```

Override vertical/nested slide separator (default: `\n----\n`):

```console
reveal-md slides.md --vertical-separator "^\n\n"
```

### Custom Slide Attributes

Use the [reveal.js slide attributes][36] functionality to add HTML attributes, e.g. custom backgrounds. Alternatively,
add an HTML `id` attribute to a specific slide and style it with CSS.

Example: set the second slide to have a PNG image as background:

```markdown
# slide1

This slide has no background image.

---

<!-- .slide: data-background="./image1.png" -->

# slide2

This one does!
```

### reveal-md Options

Define options similar to command-line options in a `reveal-md.json` file that must be located at the root of the
Markdown files. They'll be picked up automatically. Example:

```json
{
  "separator": "^\n\n\n",
  "verticalSeparator": "^\n\n"
}
```

### Reveal.js Options

Define Reveal.js [options][37] in a `reveal.json` file at the project root. They'll be picked up automatically. Example:

```json
{
  "controls": true,
  "progress": true
}
```

### Speaker Notes

Use the [speaker notes][38] feature by using a line starting with `Note:`.

### YAML Front matter

Set Markdown (and reveal.js) options specific to a presentation with YAML front matter:

```markdown
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

Using `-w` option changes to markdown files will trigger the browser to reload and thus display the changed presentation
without the user having to reload the browser.

```console
reveal-md slides.md -w
```

### Custom Scripts

Inject custom scripts into the page:

```console
reveal-md slides.md --scripts script.js,another-script.js
```

- Don't use absolute file paths, files should be in adjacent or descending folders.
- Absolute URL's are allowed.

### Custom CSS

Inject custom CSS into the page:

```console
reveal-md slides.md --css style.css,another-style.css
```

- Don't use absolute file paths, files should be in adjacent or descending folders.
- Absolute URL's are allowed.

### Custom Favicon

If the directory with the markdown files contains a `favicon.ico` file, it will automatically be used as a favicon
instead of the [default favicon][39].

### Pre-process Markdown

`reveal-md` can be given a markdown preprocessor script via the `--preprocessor` (or `-P`) option. This can be useful to
implement custom tweaks on the document format without having to dive into the guts of the Markdown parser.

For example, to have headers automatically create new slides, one could have the script `preproc.js`:

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

```console
reveal-md --preprocessor ./preproc.js slides.md
```

### Print to PDF

There are (at least) two options to export a deck to a PDF file.

#### 1. Using Puppeteer

Create a (printable) PDF from the provided Markdown file:

```console
reveal-md slides.md --print slides.pdf
```

The PDF is generated using Puppeteer. Alternatively, append `?view=print` to the url from the command-line or in the
browser (make sure to remove the `#/` or `#/1` hash). Then print the slides using the browser's (not the native) print
dialog. This seems to work in Chrome.

By default, paper size is set to match options in your [`reveal.json`][14] file, falling back to a default value 960x700
pixels. To override this behaviour, you can pass custom dimensions or format in a command line option `--print-size`:

```console
reveal-md slides.md --print slides.pdf --print-size 1024x768   # in pixels when no unit is given
reveal-md slides.md --print slides.pdf --print-size 210x297mm  # valid units are: px, in, cm, mm
reveal-md slides.md --print slides.pdf --print-size A4         # valid formats are: A0-6, Letter, Legal, Tabloid, Ledger
```

In case of an error, please try the following:

- Analyze debug output, e.g. `DEBUG=reveal-md reveal-md slides.md --print`
- See `reveal-md help` for Puppeteer arguments (`puppeteer-launch-args` and `puppeteer-chromium-executable`)
- Use Docker & DeckTape:

#### 2. Using Docker & DeckTape

The first method of printing does not currently work when running reveal-md in a Docker container, so it is recommended
that you print with [DeckTape][40] instead. Using DeckTape may also resolve issues with the built-in printing method’s
output.

To create a PDF of a presentation using reveal-md running on your localhost using the DeckTape Docker image, use the
following command:

```console
docker run --rm -t --net=host -v $OUTPUT_DIR:/slides astefanutti/decktape $URL $OUTPUT_FILENAME
```

Replace these variables:

- `$OUTPUT_DIR` is the folder you want the PDF to be saved to.
- `$OUTPUT_FILENAME` is the name of the PDF.
- `$URL` is where the presentation can be accessed in your browser (without the `?view=print` suffix). If you are not
  running reveal-md in Docker, you will need to replace `localhost` with the IP address of your computer.

For a full list of export options, please see the the [DeckTape github][40], or run the Docker container with the `-h`
flag.

### Static Website

This will export the provided Markdown file into a stand-alone HTML website including scripts and stylesheets. The files
are saved to the directory passed to the `--static` parameter (default: `./_static`):

```console
reveal-md slides.md --static _site
```

This should copy images along with the slides. Use `--static-dirs` to copy directories with other static assets to the
target directory. Use a comma-separated list to copy multiple directories.

```console
reveal-md slides.md --static --static-dirs=assets
```

Providing a directory will result in a stand-alone overview page with links to the presentations (similar to a
[directory listing][27]):

```console
reveal-md dir/ --static
```

By default, all `*.md` files in all subdirectories are included in the generated website. Provide a custom [glob
pattern][41] using `--glob` to generate slides only from matching files:

```console
reveal-md dir/ --static --glob '**/slides.md'
```

Additional `--absolute-url` and `--featured-slide` parameters could be used to generate [OpenGraph][42] metadata
enabling more attractive rendering for slide deck links when shared in some social sites.

```console
reveal-md slides.md --static _site --absolute-url https://example.com --featured-slide 5
```

### Disable Auto-open Browser

To disable auto-opening the browser:

```console
reveal-md slides.md --disable-auto-open
```

### Directory Listing

Show (recursive) directory listing of Markdown files:

```console
reveal-md dir/
```

Show directory listing of Markdown files in current directory:

```console
reveal-md
```

### Custom Port

Override port (default: `1948`):

```console
reveal-md slides.md --port 8888
```

### Custom Template

Override reveal.js HTML template ([default template][43]):

```console
reveal-md slides.md --template my-reveal-template.html
```

Override listing HTML template ([default template][44]):

```console
reveal-md slides.md --listing-template my-listing-template.html
```

## Scripts, Preprocessors and Plugins

- [reveal-md-scripts][45]
- [How to add reveal.js plugins][58]

## Related Projects & Alternatives

- [Slides][46] is a place for creating, presenting and sharing slide decks.
- [Sandstorm Hacker Slides][47] is a simple app that combines Ace Editor and RevealJS.
- [Tools][48] in the Plugins, Tools and Hardware section of Reveal.js.
- [Org-Reveal][49] exports Org-mode contents to Reveal.js HTML presentation.
- [DeckTape][40] is a high-quality PDF exporter for HTML5 presentation frameworks.
- [GitPitch][50] generates slideshows from PITCHME.md found in hosted Git repos.

## Articles About reveal-md

- [great slides with reveal markdown][51]
- [Create your own auto-publishing slides with reveal-md and Travis CI][52]
- [Beautiful presentations from markdown — who knew it could be so easy?][53]
- [Using reveal-md to create technical presentations][54]
- [Use reveal-md to generate multiple slides and host them on GitHub Page][55]

## Thank You

Many thanks to all [contributors][56]!

## License

[MIT][57]

[1]: https://revealjs.com
[2]: http://localhost:1948
[3]: #installation
[4]: #usage
[5]: #revealjs-v4
[6]: #docker
[7]: #features
[8]: #markdown
[9]: #theme
[10]: #highlight-theme
[11]: #custom-slide-separators
[12]: #custom-slide-attributes
[13]: #reveal-md-options
[14]: #revealjs-options
[15]: #speaker-notes
[16]: #yaml-front-matter
[17]: #live-reload
[18]: #custom-scripts
[19]: #custom-css
[20]: #custom-favicon
[21]: #pre-process-markdown
[22]: #print-to-pdf
[23]: #1-using-puppeteer
[24]: #2-using-docker--decktape
[25]: #static-website
[26]: #disable-auto-open-browser
[27]: #directory-listing
[28]: #custom-port
[29]: #custom-template
[30]: #scripts-preprocessors-and-plugins
[31]: #related-projects--alternatives
[32]: #thank-you
[33]: #license
[34]: https://github.com/hakimel/reveal.js/tree/master/css/theme/source
[35]: https://github.com/isagalaev/highlight.js/tree/master/src/styles
[36]: https://revealjs.com/markdown/#slide-attributes
[37]: https://revealjs.com/config/
[38]: https://revealjs.com/speaker-view/
[39]: lib/favicon.ico
[40]: https://github.com/astefanutti/decktape
[41]: https://github.com/isaacs/node-glob
[42]: http://ogp.me
[43]: https://github.com/webpro/reveal-md/blob/master/lib/template/reveal.html
[44]: https://github.com/webpro/reveal-md/blob/master/lib/template/listing.html
[45]: https://github.com/amra/reveal-md-scripts
[46]: https://slides.com/
[47]: https://github.com/jacksingleton/hacker-slides
[48]: https://github.com/hakimel/reveal.js/wiki/Plugins,-Tools-and-Hardware#tools
[49]: https://github.com/yjwen/org-reveal
[50]: https://github.com/gitpitch/gitpitch
[51]: https://csinva.io/blog/misc/19_reveal_md_enhanced/readme.html
[52]: https://ericmjl.github.io/blog/2020/1/18/create-your-own-auto-publishing-slides-with-reveal-md-and-travis-ci/
[53]: https://mandieq.medium.com/beautiful-presentations-from-markdown-who-knew-it-could-be-so-easy-d279aa7f787a
[54]: https://lacourt.dev/2019/03/12
[55]: https://hanklu.tw/blog/use-reveal-md-to-generate-multiple-slides-and-host-them-on-github-page/
[56]: https://github.com/webpro/reveal-md/graphs/contributors
[57]: http://webpro.mit-license.org
[58]: https://github.com/webpro/reveal-md/issues/102#issuecomment-692494366
[59]: #code-section
