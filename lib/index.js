'use strict';
const path = require('path'),
  debug = require('debug')('reveal-md'),
  bluebird = require('bluebird'),
  parseOptions = require('./options').parseOptions,
  startServer = require('./serve'),
  print = require('./print'),
  renderStaticMarkup = require('./static');

bluebird.promisifyAll(require('fs-extra'));

let revealOptions = {};
try {
  revealOptions = require(path.join(process.cwd(), 'reveal.json'));
} catch(err) {
  debug(err.message);
}

debug('revealOptions %O', revealOptions);

module.exports = function revealMarkdown(args) {

  args.revealOptions = revealOptions;

  const options = parseOptions(args);

  debug('Parsed options %O', options);

  if(options.static) {
    renderStaticMarkup(options);
  } else if(options.print) {
    print(options);
  } else {
    startServer(options);
  }
};
