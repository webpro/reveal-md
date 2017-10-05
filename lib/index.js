'use strict';
const debug = require('debug')('reveal-md');
const bluebird = require('bluebird');
const parseOptions = require('./options').parseOptions;
const startServer = require('./serve');
const print = require('./print');
const renderStaticMarkup = require('./static');

bluebird.promisifyAll(require('fs-extra'));

module.exports = function revealMarkdown(args) {
  const options = parseOptions(args);

  debug('Parsed options %O', options);

  if (options.static) {
    renderStaticMarkup(options);
  } else if (options.print) {
    print(options);
  } else {
    startServer(options);
  }
};
