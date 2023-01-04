#!/usr/bin/env node

const argsParser = require('yargs-parser');
const updater = require('update-notifier');
const path = require('path');
const fs = require('fs-extra');
const open = require('open');
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

const { version, static: isStatic, featuredSlide, print, printSize, disableAutoOpen } = argv;

const hasPath = Boolean(argv._[0]);

updater({ pkg }).notify();

(async () => {
  /* eslint-disable no-console */
  if (version) {
    console.log(pkg.version);
  } else if (hasPath || isStatic) {
    let server, initialUrl;
    try {
      if (isStatic) {
        [server] = featuredSlide ? await startServer() : [];
        await writeStatic();
        server && server.close();
      } else if (print) {
        [server, initialUrl] = await startServer();
        await exportPDF(initialUrl, print, printSize);
        server.close();
      } else {
        [server, initialUrl] = await startServer();
        console.log(`The slides are at ${initialUrl}`);
        !disableAutoOpen && open(initialUrl, { url: true });
        process.on('SIGINT', () => {
          console.log('Received SIGINT, closing gracefully.');
          server.close();
          process.exit(128);
        });
      }
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  } else {
    const help = await fs.readFile(path.join(__dirname, './help.txt'));
    console.log(help.toString());
  }
})();
