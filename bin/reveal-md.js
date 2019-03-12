#!/usr/bin/env node

const argsParser = require('yargs-parser');
const updater = require('update-notifier');
const path = require('path');
const fs = require('fs-extra');
const opn = require('opn');
const pkg = require('../package.json');
const startServer = require('../lib/server');
const writeStatic = require('../lib/static');
const exportPDF = require('../lib/print');

const alias = {
  h: 'help',
  s: 'separator',
  S: 'vertical-separator',
  t: 'theme',
  V: 'version'
};

const argv = argsParser(process.argv.slice(2), { alias });

const { version, static: isStatic, featuredSlide, print, disableAutoOpen } = argv;

const [isStartServer] = argv._;

updater({ pkg }).notify();

(async () => {
  /* eslint-disable no-console */
  if (version) {
    console.log(pkg.version);
  } else if (isStartServer || isStatic) {
    try {
      const [server, initialUrl] = isStartServer || (isStatic && featuredSlide) ? await startServer() : [];
      if (isStatic) {
        await writeStatic();
        server.close();
      } else if (print) {
        await exportPDF(initialUrl, print);
        server.close();
      } else if (!disableAutoOpen) {
        opn(initialUrl);
      }
    } catch (err) {
      console.error(err);
    }
  } else {
    const help = await fs.readFile(path.join(__dirname, './help.txt'));
    console.log(help.toString());
  }
})();
