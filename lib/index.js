'use strict';
const debug = require('debug')('reveal-md'),
  bluebird = require('bluebird'),
  parseOptions = require('./options').parseOptions,
  startServer = require('./serve'),
  print = require('./print'),
  renderStaticMarkup = require('./static').renderStaticMarkup,
  renderStandaloneMarkup = require('./static').renderStandaloneMarkup,
  renderPrintout = require('./static').renderPrintout;
bluebird.promisifyAll(require('fs-extra'));

module.exports = function revealMarkdown(args) {

  const options = parseOptions(args);

  debug('Parsed options %O', options);

  if(options.static) {
    renderStaticMarkup(options);
  } else if(options.standalone) {
    renderStandaloneMarkup(options);
  } else if(options.printout) {
    renderPrintout(options);
  } else if(options.print) {
    print(options);
  } else {
    startServer(options);
  }
};
