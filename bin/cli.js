#!/usr/bin/env node

'use strict';
const path = require('path'),
  program = require('commander'),
  debug = require('debug')('reveal-md'),
  _ = require('lodash'),
  libDefaults = require('../lib/defaults'),
  revealMarkdown = require('./../lib'),
  pkg = require('../package.json');


  function list(val) {
    return val.split(',');
  }

let localOptions = {};
try {
  localOptions = require(path.join(process.cwd(), 'reveal-md.json'));
} catch(err) {
  debug(err.message);
}
debug('localOptions %O', localOptions);

let revealOptions = {};
try {
  revealOptions = require(path.join(process.cwd(), 'reveal.json'));
} catch(err) {
  debug(err.message);
}
debug('revealOptions %O', revealOptions);

const defaults = _.extend({}, libDefaults, localOptions);

program
  .version(pkg.version)
  .usage('<slides.md> [options]')
  .option('-D, --disable-auto-open', 'Disable auto-opening your web browser', defaults.disableAutoOpen)
  .option('-H, --highlight-theme <theme>', `Highlight theme [${libDefaults.highlightTheme}]`, defaults.highlightTheme)
  .option('-h, --host <host>', `Host [${libDefaults.host}]`, defaults.host)
  .option('-i, --scripts <scripts>', 'Scripts to inject into the page', defaults.scripts)
  .option('-c, --css <css>', 'CSS files to inject into the page', defaults.css)
  .option('-m, --preprocessor <script>', 'Markdown preprocessor script', defaults.preprocessor)
  .option('-p, --port <port>', `Port [${libDefaults.port}]`, defaults.port)
  .option('-P, --print [filename]', 'Print', defaults.print)
  .option('-t, --theme <theme>', `Theme [${libDefaults.theme}]`, defaults.theme)
  .option('-T, --title <title>', 'Title of the presentation', defaults.title)
  .option('-s, --separator <separator>', 'Slide separator', defaults.separator)
  .option('-S, --static [dir]', 'Export static html to directory [_static]. Incompatible with --print.', defaults.static)
  .option('-S, --static-dirs <dirs>', 'Extra directories to copy into static directory. Only used in conjunction with --static.', list, defaults.staticDirs)
  .option('-v, --vertical-separator <separator>', 'Vertical slide separator', defaults.verticalSeparator)
  .option('-w, --watch', `Watch for changes in markdown file and livereload presentation [${libDefaults.watch}]`, defaults.watch)
  .parse(process.argv);

if(program.args.length > 2) {
  program.help();
}

program.revealOptions = revealOptions;

revealMarkdown(program);
