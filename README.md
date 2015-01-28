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

Note: speaker notes FTW!

```

The separator syntax can be overriden (e.g. I like to use three blank lines).

## Speaker Notes

You can use the [speaker notes](https://github.com/hakimel/reveal.js#speaker-notes) feature by using a line starting with `Note:`.


## Usage

To open specific Markdown file as Reveal.js slideshow:

``` bash
reveal-md slides.md
```

You can also provide a url that resolves to a Markdown resource (over http(s)).

``` bash
reveal-md https://raw.github.com/webpro/reveal-md/master/demo/a.md
```

Show (recursive) directory listing of Markdown files:

``` bash
reveal-md dir/
```

Show directory listing of Markdown files in current directory:

``` bash
reveal-md
```

Override theme (default: `black`):

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

## Print Support

*Requires phantomjs to be installed (preferably globally)*

This will try to create a pdf with the passed in file (eg slides.md) and outputted to the name passed into the `--print` parameter (eg slides.pdf)

``` bash
reveal-md slides.md --print slides.pdf
```

## Options

You can define Reveal.js [options](https://github.com/hakimel/reveal.js#configuration) in a `reveal.json` file that you should put in the root directory of the Markdown files. They'll be picked up automatically.

## Notes

* `reveal-md` always starts a local server and opens the default browser
* From any presentation, navigate to the root (e.g. [http://localhost:1948](http://localhost:1948)) to get directory listing of (linked) Markdown files. Root folder is resolved from Markdown file (or directory) `reveal-md` was started with.

## License

[MIT](http://webpro.mit-license.org)
