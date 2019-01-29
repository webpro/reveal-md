#!/usr/bin/env node

const argsParser = require('yargs-parser');
const updater = require('update-notifier');
const path = require('path');
const fs = require('fs-extra');
const pkg = require('../package.json');
const startServer = require('../lib/server');
const writeStatic = require('../lib/static');
const exportPDF = require('../lib/print');
const opn = require('opn');

const alias = {
  h: 'help',
  s: 'separator',
  S: 'vertical-separator',
  t: 'theme',
  V: 'version',
  w: 'watch'
};

const argv = argsParser(process.argv.slice(2), { alias });

updater({ pkg }).notify();

(async () => {
  if (argv.version) {
    console.log(pkg.version); // eslint-disable-line no-console
  } else if (argv.static) {
    let server;
    if (argv.featuredSlide) {
      [server] = await startServer();
    }
    await writeStatic();
    if (server) {
      server.close();
    }
  } else if (argv._[0]) {
    const [server, initialUrl] = await startServer();
    if (argv.print) {
      await exportPDF(initialUrl, argv.print);
      server.close();
    } else if (!argv.disableAutoOpen) {
      opn(initialUrl);
    }
  } else {
    const help = await fs.readFile(path.join(__dirname, './help.txt'));
    console.log(help.toString()); // eslint-disable-line no-console
  }
})();
