#!/usr/bin/env node

const program = require('commander'),
  defaults = require('../lib/defaults'),
  revealMarkdown = require('./../lib'),
  pkg = require('../package.json');

program
  .version(pkg.version)
  .usage('<slides.md> [options]')
  .option('-D, --disable-auto-open', 'Disable auto-opening your web browser', defaults.disableAutoOpen)
  .option('-H, --highlight-theme <theme>', 'Highlight theme [zenburn]', defaults.highlightTheme)
  .option('-h, --host <host>', 'Host [localhost]', defaults.host)
  .option('-i, --scripts <scripts>', 'Scripts to inject into the page', defaults.scripts)
  .option('-m, --preprocessor <script>', 'Markdown preprocessor script', defaults.preprocessor)
  .option('-p, --port <port>', 'Port [1948]', defaults.port)
  .option('-P, --print [filename]', 'Print', defaults.print)
  .option('-t, --theme <theme>', 'Theme [black]', defaults.theme)
  .option('-T, --title <title>', 'Title of the presentation', defaults.title)
  .option('-s, --separator <separator>', 'Slide separator', defaults.separator)
  .option('-S, --static [dir]', 'Export static html to directory [_static]. Incompatible with --print.', defaults.static)
  .option('-S, --static-dirs <dirs>', 'Extra directories to copy into static directory. Only used in conjunction with --static.', defaults.staticDirs)
  .option('-v, --vertical-separator <separator>', 'Vertical slide separator', defaults.verticalSeparator)
  .option('-w, --watch', 'Watch for changes in markdown file and livereload presentation [false]', defaults.watch)
  .parse(process.argv);

if(program.args.length > 2) {
  program.help();
}

revealMarkdown(program);
