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
  .option('    --disable-auto-open', 'Disable auto-opening your web browser')
  .option('    --highlight-theme <theme>', `Highlight theme [default: ${defaults.highlightTheme}]`)
  .option('    --host <host>', `Host [default: ${defaults.host}]`)
  .option('    --scripts <files>', 'Scripts to inject into the page')
  .option('    --css <files>', 'CSS files to inject into the page')
  .option('    --preprocessor <script>', 'Markdown preprocessor script')
  .option('    --port <port>', `Port [default: ${defaults.port}]`)
  .option('    --print [filename]', 'Print')
  .option('-t, --theme <theme>', `Theme [default: ${defaults.theme}]`)
  .option('    --title <title>', 'Title of the presentation')
  .option('-s, --separator <separator>', 'Slide separator')
  .option('    --static [dir]', 'Export static html to directory [_static]. Incompatible with --print.')
  .option('    --static-dirs <dirs>', 'Extra directories to copy into static directory. Only used in conjunction with --static.')
  .option('-S, --vertical-separator <separator>', 'Vertical slide separator')
  .option('-w, --watch', `Watch for changes in markdown file and livereload presentation [default: ${defaults.watch}]`)
  .option('    --template <filename>', 'Template file for reveal.js')
  .option('    --listing-template <filename>', 'Template file for listing')
  .parse(process.argv);

if(program.args.length > 2) {
  program.help();
}

revealMarkdown(program);
