'use strict';
const path = require('path');
const got = require('got');
const debug = require('debug')('reveal-md');
const express = require('express');
const _ = require('lodash');
const liveReload = require('livereload');
const open = require('open');
const render = require('./render');
const parsePath = require('./options').parsePath;

const staticDir = express.static;

let initialOptions;

function updatePathOptions(req, res, next) {
  const pathOpts = parsePath(req.url, initialOptions.baseDir);
  res.locals.options = _.extend({}, initialOptions, pathOpts);
  debug('Update path options to %O', pathOpts);
  next();
}

function getAsset(req, res) {
  res.sendFile(path.resolve(process.cwd(), req.url.replace(/^\/_assets\//, '')));
}

module.exports = function startServer(options, cb) {
  initialOptions = options;

  const app = express();

  ['css', 'js', 'plugin', 'lib'].forEach(dir => {
    app.use('/' + dir, staticDir(path.join(options.revealBasePath, dir)));
  });

  app.use('/css/highlight', staticDir(options.highlightThemePath));

  if (options.watch) {
    const liveReloadServer = liveReload.createServer({
      exts: ['md']
    });
    liveReloadServer.watch(process.cwd());
  }

  app.get('/', updatePathOptions, render.renderMarkdownFileListing);
  app.get(/(\w+\.md)$/, updatePathOptions, render.renderMarkdownAsSlides);
  app.get('/_assets/*', getAsset);
  if (options.basePath || options.baseDir) {
    const virtualPath = options.relativePath ? path.dirname(options.relativePath) : '.';
    app.use(virtualPath !== '.' ? '/' + virtualPath : '/', staticDir(options.basePath || options.baseDir));
  } else if (options.url) {
    app.use('/*', (req, res) => got.stream(req.params[0]).pipe(res));
  }

  const server = app.listen(options.port);
  const host = `http://${options.host}:${options.port}`;
  const link = options.relativePath || options.url;
  const url = `${host}${link ? '/' + link : ''}`;

  if (!options.print) {
    console.log(`Reveal-server started at ${host}`);
    if (!options.disableAutoOpen) {
      open(url);
    }
  }

  if (cb) cb(server);
};
