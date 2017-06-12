'use strict';
const path = require('path'),
  debug = require('debug')('reveal-md'),
  express = require('express'),
  _ = require('lodash'),
  liveReload = require('livereload'),
  open = require('open'),
  render = require('./render'),
  parsePath = require('./options').parsePath;

const staticDir = express.static;

let initialOptions;

function updatePathOptions(req, res, next) {
  const pathOpts = parsePath(req.url, initialOptions.baseDir);
  res.locals.options = _.extend({}, initialOptions, pathOpts);
  debug('Update path options to %O', pathOpts);
  next();
}

function getAsset(req, res) {
  res.sendFile(path.resolve(process.cwd(), req.url.replace(/^\/assets\//, '')));
}

module.exports = function startServer(options, cb) {

  initialOptions = options;

  const app = express();

  ['css', 'js', 'plugin', 'lib'].forEach(dir => {
    app.use('/' + dir, staticDir(path.join(options.revealBasePath, dir)));
  });

  app.use('/css/highlight', staticDir(options.highlightThemePath));

  if(options.watch) {
    const liveReloadServer = liveReload.createServer({
      exts: ['md']
    });
    liveReloadServer.watch(process.cwd());
  }

  app.get('/', updatePathOptions, render.renderMarkdownFileListing);
  app.get(/(\w+\.md)$/, updatePathOptions, render.renderMarkdownAsSlides);
  app.get('/assets/*', getAsset);
  app.use(staticDir(process.cwd()));

  const server = app.listen(options.port);

  const host = `http://${options.host}:${options.port}`;
  const link = options.relativePath || options.url;
  const url = `${host}${link ? '/' + link : ''}`;

  if(!options.print) {
    /* eslint-disable no-console */
    console.log(`Reveal-server started at ${host}`);
    if(!options.disableAutoOpen) {
      open(url);
    }
  }

  if(cb) cb(server);

};
