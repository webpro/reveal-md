#!/usr/bin/env node

import argsParser from 'yargs-parser';
import updater from 'update-notifier';
import path from 'node:path';
import url from 'node:url';
import { readFile } from 'node:fs/promises';
import open from 'open';
import startServer from '../lib/server.js';
import writeStatic from '../lib/static.js';
import exportPDF from '../lib/print.js';
import { loadJSON } from '../lib/util.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const pkg = loadJSON(path.join(__dirname, '../package.json'));

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
    const help = await readFile(path.join(__dirname, './help.txt'));
    console.log(help.toString());
  }
})();
