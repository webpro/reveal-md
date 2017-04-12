#!/usr/bin/env node

const program = require('commander'),
  defaults = require('../lib/options').getDefaults(),
  revealMarkdown = require('./../lib'),
  pkg = require('../package.json');

program
  .version(pkg.version)
  .usage('<slides.md> [options]')
  .option('-D, --disable-auto-open', 'Disable auto-opening your web browser', defaults.disableAutoOpen)
  .option('-H, --highlight-theme <theme>', `Highlight theme [${defaults.highlightTheme}]`, defaults.highlightTheme)
  .option('-h, --host <host>', `Host [${defaults.host}]`, defaults.host)
  .option('-i, --scripts <scripts>', 'Scripts to inject into the page', defaults.scripts)
  .option('-m, --preprocessor <script>', 'Markdown preprocessor script', defaults.preprocessor)
  .option('-p, --port <port>', `Port [${defaults.port}]`, defaults.port)
  .option('-P, --print [filename]', 'Print', defaults.print)
  .option('-t, --theme <theme>', `Theme [${defaults.theme}]`, defaults.theme)
  .option('-T, --title <title>', 'Title of the presentation', defaults.title)
  .option('-s, --separator <separator>', 'Slide separator', defaults.separator)
  .option('-S, --static [dir]', `Export static html to directory [${typeof defaults.static === 'string' ? defaults.static : '_static'}]. Incompatible with --print.`, defaults.static)
  .option('-v, --vertical-separator <separator>', 'Vertical slide separator', defaults.verticalSeparator)
  .option('-w, --watch', `Watch for changes in markdown file and livereload presentation [${defaults.watch}]`, defaults.watch)
  .parse(process.argv);

if(program.args.length > 2) {
  program.help();
}

revealMarkdown(program);
