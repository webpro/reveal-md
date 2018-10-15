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
  .description('See https://github.com/webpro/reveal-md for more details.')
  .option('    --title <title>', 'Title of the presentation')
  .option(`-s, --separator <separator>`, `Slide separator [default: 3 dashes (---) surrounded by two blank lines]`)
  .option(
    '-S, --vertical-separator <separator>',
    'Vertical slide separator [default: 4 dashes (----) surrounded by two blank lines]'
  )
  .option('-t, --theme <theme>', `Theme [default: ${defaults.theme}]`)
  .option('    --highlight-theme <theme>', `Highlight theme [default: ${defaults.highlightTheme}]`)
  .option('    --css <files>', 'CSS files to inject into the page')
  .option('    --scripts <files>', 'Scripts to inject into the page')
  .option('    --assets-dir <dirname>', `Defines assets directory name [default: ${defaults.assetsDir}]`)
  .option('    --preprocessor <script>', 'Markdown preprocessor script')
  .option('    --template <filename>', 'Template file for reveal.js')
  .option('    --listing-template <filename>', 'Template file for listing')
  .option('    --print [filename]', 'Print to PDF file')
  .option('    --static [dir]', 'Export static html to directory [_static]. Incompatible with --print.')
  .option(
    '    --static-dirs <dirs>',
    'Extra directories to copy into static directory. Only used in conjunction with --static.'
  )
  .option('-w, --watch', `Watch for changes in markdown file and livereload presentation`)
  .option('    --disable-auto-open', 'Disable auto-opening your web browser')
  .option('    --host <host>', `Host [default: ${defaults.host}]`)
  .option('    --port <port>', `Port [default: ${defaults.port}]`)
  .option(
    '    --featured-slide <num>',
    'Capture snapshot from this slide (numbering starts from 1) and use it as og:image for static build. Defaults to first slide. Only used with --static.'
  )
  .option(
    '    --absolute-url <url>',
    'Define url used for hosting static build. This is included in OpenGraph metadata. Only used with --static.'
  )
  .option(
    '    --puppeteer-launch-args <args>',
    'Customize how Puppeteer launches Chromium. The arguments are specified as a space separated list (for example "--no-sandbox --disable-dev-shm-usage"). Needed for some CI setups.'
  )
  .option(
    '    --puppeteer-chromium-executable <path>',
    'Customize which Chromium executable puppeteer will launch. Allows to use a globally installed version of Chromium.'
  )
  .parse(process.argv);

if (program.args.length > 2) {
  program.help();
}

revealMarkdown(program);
