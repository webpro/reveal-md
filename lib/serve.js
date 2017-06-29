'use strict';
const path = require('path'),
  got = require('got'),
  debug = require('debug')('reveal-md'),
  express = require('express'),
  _ = require('lodash'),
  liveReload = require('livereload'),
  open = require('open'),
  render = require('./render'),
  parsePath = require('./options').parsePath;

const staticDir = express.static;

const liveReloadPort = Math.floor(Math.random() * (11000 - 10000) + 10000);

let initialOptions;

function updatePathOptions(req, res, next) {
  const pathOpts = parsePath(req.url, initialOptions.baseDir);
  res.locals.options = _.extend({}, initialOptions, pathOpts);
  debug('Update path options to %O', pathOpts);
  next();
}

function updateLiveReloadPort(req, res, next) {
  res.locals.options.liveReloadPort = liveReloadPort;
  next();
}

function getScript(req, res) {
  res.sendFile(path.resolve(process.cwd(), req.url.replace(/^\/scripts\//, '')));
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
      port: liveReloadPort,
      exts: ['md']
    });
    liveReloadServer.watch(process.cwd());
  }

  app.get('/', updatePathOptions, updateLiveReloadPort, render.renderMarkdownFileListing);
  app.get(/(\w+\.md)$/, updatePathOptions, updateLiveReloadPort, render.renderMarkdownAsSlides);
  app.get('/scripts/*', getScript);
  app.get('/assets/*', getAsset);
  
  if(options.basePath || options.baseDir) {
    const virtualPath = options.relativePath ? path.dirname(options.relativePath) : '.';
    app.use(virtualPath !== '.' ? '/' + virtualPath : '/', staticDir(options.basePath || options.baseDir));
  } else if(options.url) {
    app.use('/*', (req, res) => got.stream(req.params[0]).pipe(res));
  }

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
