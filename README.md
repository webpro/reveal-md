# reveal-md

[reveal.js](http://lab.hakim.se/reveal-js/#/) on steroids! Get beautiful reveal.js presentations from your Markdown files.

## Installation

``` bash
npm install -g reveal-md
```

## Quick demo

``` bash
reveal-md demo
```

## Markdown in reveal.js

The Markdown feature of reveal.js is awesome, and has an easy (and configurable) syntax to separate slides.
Use three dashes surrounded by two blank lines (`\n---\n`).
Example:

``` text
# Title

* Point 1
* Point 2

---

## Second slide

> Best quote ever.

```

The separator syntax can be overriden (e.g. I like to use three blank lines).

## Usage

To open specific Markdown file as Reveal.js slideshow:

``` bash
reveal-md slides.md
```

Show (recursive) directory listing of Markdown files:

``` bash
reveal-md dir/
```

Show directory listing of Markdown files in current directory:

``` bash
reveal-md
```

Override theme (default: `default`):

``` bash
reveal-md slides.md --theme solarized
```

Override slide separator (default: `\n---\n`):

``` bash
reveal-md slides.md --separator "^\n\n\n"
```

Override vertical/nested slide separator (default: `\n----\n`):

``` bash
reveal-md slides.md --vertical "^\n\n"
```

Override port (default: `1948`):

``` bash
reveal-md slides.md --port 8888
```

## Notes

* `reveal-md` always starts a local server and opens the default browser
* From any presentation, navigate to the root (e.g. [http://localhost:1948](http://localhost:1948)) to get directory listing of (linked) Markdown files. Root folder is resolved from Markdown file (or directory) `reveal-md` was started with.

## License

[MIT](http://webpro.mit-license.org)
