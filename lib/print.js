const path = require('path');
const _ = require('lodash');
const startServer = require('./serve');
const puppeteer = require('puppeteer');
const exec = require('child_process').exec;
const debug = require('debug')('reveal-md');

module.exports = function print(options) {
  const printPluginPath = path.join(options.revealBasePath, 'plugin', 'print-pdf', 'print-pdf.js');

  const opts = _.extend({}, options, {
    print: true,
    disableAutoOpen: true
  });

  startServer(opts, server => {
    const { initialPath } = options;
    const url = `http://${options.host}:${options.port}/${initialPath}`;

    const pdfFilename =
      options.print === true ? path.basename(initialPath).replace(/\.md$/, '') : options.print.replace(/\.pdf$/, '');

    debug({ initialPath, url, printPluginPath, pdfFilename });

    console.log(`Attempting to print "${initialPath}?print-pdf" to filename "${pdfFilename}.pdf" as PDF.`);

    return puppeteer
      .launch()
      .then(browser =>
        browser.newPage().then(page => {
          return page.goto(`${url}?print-pdf`, { waitUntil: 'load' }).then(() => {
            return page
              .pdf({
                path: `${pdfFilename}.pdf`,
                format: 'A4',
                printBackground: true
              })
              .then(() => browser.close())
              .then(() => server.close());
          });
        })
      )
      .catch(err => {
        debug(err);
        console.error(`[Error while generating PDF for "${options.relativePath}"]\n${err.toString()}`);
      });
  });
};
