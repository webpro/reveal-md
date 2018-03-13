#!/usr/bin/env node

'use strict';
const path = require('path');
const program = require('commander');
const defaults = require('../lib/defaults');
const revealMarkdown = require('./../lib');
const pkg = require('../package.json');

program
  .version(pkg.version)
  .usage('<slides.md> [options]')
  .option('    --disable-auto-open', 'Disable auto-opening your web browser', defaults.disableAutoOpen)
  .option('    --highlight-theme <theme>', `Highlight theme [${defaults.highlightTheme}]`, defaults.highlightTheme)
  .option('    --host <host>', `Host [${defaults.host}]`, defaults.host)
  .option('    --scripts <files>', 'Scripts to inject into the page', defaults.scripts)
  .option('    --css <files>', 'CSS files to inject into the page', defaults.css)
  .option('    --preprocessor <script>', 'Markdown preprocessor script', defaults.preprocessor)
  .option('    --port <port>', `Port [${defaults.port}]`, defaults.port)
  .option('    --print [filename]', 'Print', defaults.print)
  .option('-t, --theme <theme>', `Theme [${defaults.theme}]`)
  .option('    --title <title>', 'Title of the presentation')
  .option('-s, --separator <separator>', 'Slide separator')
  .option('    --static [dir]', 'Export static html to directory [_static]. Incompatible with --print.', defaults.static)
  .option('    --static-dirs <dirs>', 'Extra directories to copy into static directory. Only used in conjunction with --static.', defaults.staticDirs)
  .option('-S, --vertical-separator <separator>', 'Vertical slide separator')
  .option('-w, --watch', `Watch for changes in markdown file and livereload presentation [${defaults.watch}]`, defaults.watch)
  .option('    --template <filename>', 'Template file for reveal.js', defaults.template)
  .option('    --listing-template <filename>', 'Template file for listing', defaults.listingTemplate)
  .parse(process.argv);

if(program.args.length > 2) {
  program.help();
}

revealMarkdown(program);
