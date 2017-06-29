#!/usr/bin/env node

'use strict';
const path = require('path'),
  program = require('commander'),
  debug = require('debug')('reveal-md'),
  _ = require('lodash'),
  libDefaults = require('../lib/defaults'),
  revealMarkdown = require('./../lib'),
  pkg = require('../package.json');

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
  .option('    --disable-auto-open', 'Disable auto-opening your web browser', defaults.disableAutoOpen)
  .option('    --highlight-theme <theme>', `Highlight theme [${libDefaults.highlightTheme}]`, defaults.highlightTheme)
  .option('    --host <host>', `Host [${libDefaults.host}]`, defaults.host)
  .option('    --scripts <files>', 'Scripts to inject into the page', defaults.scripts)
  .option('    --css <files>', 'CSS files to inject into the page', defaults.css)
  .option('    --preprocessor <script>', 'Markdown preprocessor script', defaults.preprocessor)
  .option('    --port <port>', `Port [${libDefaults.port}]`, defaults.port)
  .option('    --print [filename]', 'Print', defaults.print)
  .option('-t, --theme <theme>', `Theme [${libDefaults.theme}]`, defaults.theme)
  .option('    --title <title>', 'Title of the presentation', defaults.title)
  .option('-s, --separator <separator>', 'Slide separator', defaults.separator)
  .option('    --static [dir]', 'Export static html to directory [_static]. Incompatible with --print.', defaults.static)
  .option('    --static-dirs <dirs>', 'Extra directories to copy into static directory. Only used in conjunction with --static.', defaults.staticDirs)
  .option('-S, --vertical-separator <separator>', 'Vertical slide separator', defaults.verticalSeparator)
  .option('-w, --watch', `Watch for changes in markdown file and livereload presentation [${libDefaults.watch}]`, defaults.watch)
  .option('    --template <filename>', 'Template file for reveal.js', defaults.template)
  .option('    --listing-template <filename>', 'Template file for listing', defaults.listingTemplate)
  .parse(process.argv);

if(program.args.length > 2) {
  program.help();
}

program.revealOptions = revealOptions;

revealMarkdown(program);
