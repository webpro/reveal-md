const path = require('path'),
  debug = require('debug')('reveal-md'),
  express = require('express'),
  _ = require('lodash'),
  liveReload = require('livereload'),
  open = require('open'),
  render = require('./render'),
  parsePath = require('./options').parsePath;

const staticDir = express.static;

function setOptions(req, res, next) {
  res.locals.options = res.locals.options || options;
  next();
}

function updatePathOptions(req, res, next) {
  const options = res.locals.options || {};
  const pathOpts = parsePath(req.url, options.baseDir);
  res.locals.options = _.extend(options, pathOpts);
  debug('Update path options to %O', pathOpts);
  next();
}

function getScript(req, res) {
  res.sendFile(path.resolve(process.cwd(), req.url.replace(/^\/scripts\//, '')));
}

module.exports = function startServer(options, cb) {

  const app = express();

  app.use(setOptions);

  ['css', 'js', 'plugin', 'lib'].forEach(dir => {
    app.use('/' + dir, staticDir(path.join(options.revealBasePath, dir)));
  });

  const highlightFilename = `${options.highlightTheme}.css`;
  app.get(`/css/highlight/${highlightFilename}`, staticDir(path.join(options.highlightThemePath, highlightFilename)));

  if(options.watch) {
    const liveReloadServer = liveReload.createServer({
      exts: ['md']
    });
    liveReloadServer.watch(process.cwd());
  }

  app.get('/', updatePathOptions, render.renderMarkdownFileListing);
  app.get(/(\w+\.md)$/, updatePathOptions, render.renderMarkdownAsSlides);
  app.get('/scripts/*', getScript);
  app.get('/*', staticDir(process.cwd()));

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
