'use strict';
const path = require('path');
const got = require('got');
const express = require('express');
const favicon = require('serve-favicon');
const url = require('url');
const _ = require('lodash');
const liveReload = require('livereload');
const opn = require('opn');
const { renderMarkdown, renderMarkdownFileListing } = require('./render');

const staticDir = express.static;

module.exports = function startServer(options, cb) {
  const app = express();

  app.use(favicon(path.join(__dirname, 'favicon.ico')));

  ['css', 'js', 'plugin', 'lib'].forEach(dir => {
    app.use('/' + dir, staticDir(path.join(options.revealBasePath, dir)));
  });

  app.use('/css/highlight', staticDir(options.highlightThemePath));

  if (options.watch) {
    const liveReloadServer = liveReload.createServer({
      /* Live Reload defaults + 'md' */
      exts: ['html', 'css', 'js', 'png', 'gif', 'jpg', 'php', 'php5', 'py', 'rb', 'erb', 'coffee', 'md']
    });
    liveReloadServer.watch(process.cwd());
  }

  app.get(/(\w+\.md)/, renderMarkdown);

  app.use(`/${options.assetsDir}`, staticDir(process.cwd()));
  app.use('/', staticDir(process.cwd()));

  app.get('/*', (req, res, next) => {
    const parsedUrl = url.parse(req.params[0], true, true);
    if (parsedUrl.host) {
      got.stream(req.params[0]).pipe(res);
    } else {
      renderMarkdownFileListing(req, res, next);
    }
  });

  const server = app.listen(options.port);
  const host = `http://${options.host}:${options.port}`;
  const initialUrl = `${host}/${options.initialPath}`;

  if (!options.print) {
    console.log(`Reveal-server started at ${host}`);
    if (!options.disableAutoOpen) {
      opn(initialUrl);
    }
  }

  if (cb) cb(server);
};
