const path = require('path');
const _ = require('lodash');
const puppeteer = require('puppeteer');
const startServer = require('./serve');
const exec = require('child_process').exec;

module.exports = function print(options) {
  const printPluginPath = path.join(options.revealBasePath, 'plugin', 'print-pdf', 'print-pdf.js');
  const opts = _.extend({}, options, {
    disableAutoOpen: true
  });

  startServer(opts, function(server) {
    const url = `http://${options.host}:${options.port}/${options.relativePath}`;
    const pdfFilename =
      options.print === true ? options.baseName.replace(/\.md$/, '') : options.print.replace(/\.pdf$/, '');
    
    console.log(`Attempting to print "${options.relativePath}" to filename "${pdfFilename}.pdf" as PDF.`);

    (async () => {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(`${url}?print-pdf`, {waitUntil: 'load'});
      await page.pdf({
        path: `${pdfFilename}.pdf`, 
        format: 'A4',
        printBackground: true
      });
    
      await browser.close();
      
      server.close();
    })();

  });
};
