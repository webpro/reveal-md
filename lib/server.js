const path = require('path');
const express = require('express');
const favicon = require('serve-favicon');
const liveReload = require('livereload');
const renderMarkdown = require('./render');
const renderMarkdownFileListing = require('./listing');
const { getInitialDir, getInitialPath, getAssetsDir, getHost, getPort, getWatch, getFaviconPath } = require('./config');
const { revealBasePath, highlightThemePath } = require('./constants');

const staticDir = express.static;

const assetsDir = getAssetsDir();
const host = getHost();
const port = getPort();
const isLiveReload = getWatch();

module.exports = async () => {
  const app = express();
  const initialDir = await getInitialDir();
  const initialPath = await getInitialPath();

  const faviconPath = await getFaviconPath();
  app.use(favicon(faviconPath));

  ['plugin', 'dist'].forEach(dir => {
    app.use('/' + dir, staticDir(path.join(revealBasePath, dir)));
  });

  app.use('/css/highlight', staticDir(highlightThemePath));

  if (isLiveReload) {
    const liveReloadServer = liveReload.createServer({
      /* Live Reload defaults + 'md' */
      exts: ['html', 'css', 'js', 'png', 'gif', 'jpg', 'php', 'php5', 'py', 'rb', 'erb', 'coffee', 'md']
    });
    liveReloadServer.watch(initialDir);
  }

  app.get(/(\w+\.md)/, renderMarkdown);

  app.use(`/${assetsDir}`, staticDir(process.cwd(), { fallthrough: false }));
  app.use('/', staticDir(initialDir));

  app.get('/*', renderMarkdownFileListing);

  const server = app.listen(port);

  console.log(`Reveal-server started at http://${host}:${port}`); // eslint-disable-line no-console

  return [server, `http://${host}:${port}/${initialPath}`];
};
