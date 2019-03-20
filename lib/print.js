const path = require('path');
const _ = require('lodash');
const startServer = require('./serve');
const debug = require('debug')('reveal-md');
let puppeteer;

try {
  puppeteer = require('puppeteer');
} catch (err) {}

module.exports = function print(options) {
  if (!puppeteer) {
    console.warn(`Puppeteer unavailable, unable to generate PDF file.`);
    return;
  }

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

    console.log(`Attempting to print "${initialPath}" to filename "${pdfFilename}.pdf" as PDF.`);

    return puppeteer
      .launch(options.puppeteerLaunchConfig)
      .then(browser =>
        browser.newPage().then(page => {
          return page.goto(`${url}?print-pdf`, { waitUntil: 'load', timeout: 0 }).then(() => {
            return page
              .pdf({
                path: `${pdfFilename}.pdf`,
                format: 'A4',
                printBackground: true
              })
              .then(() => browser.close())
              .then(() => server.close())
			        .then(() => {console.log(`"${pdfFilename}.pdf" generated successfully.`)});
          });
        })
      )
      .catch(err => {
        console.error(`Error while generating PDF for "${options.initialPath}"`);
        debug(err);
        server.close();
      });
  });
};
