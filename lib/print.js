const path = require('path');
const _ = require('lodash');
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
    console.log('Make sure to have PhantomJS installed (and in your path).');

    exec(`phantomjs ${printPluginPath} "${url}?print-pdf" "${pdfFilename}.pdf"`, function(err, stdout, stderr) {
      if (err) {
        console.error(`[Error while generating PDF for "${options.relativePath}"]\n${stderr}\n${err.toString()}`);
      } else {
        console.log(stdout);
      }
      server.close();
    });
  });
};
