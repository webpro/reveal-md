'use strict';
const fs = require('fs-extra');
const path = require('path');
const url = require('url');
const render = require('./render').render;
const parseYamlFrontMatter = require('./render').parseYamlFrontMatter;
const imageDataURI = require('image-data-uri');
const _ = require('lodash');

const mdImageRE = /!\[([^\]]*)\]\(([^)]+)\)/gi;

function embedImages(markdown, options) {
  let image;
  const awaits = [];

  while ((image = mdImageRE.exec(markdown))) {
    const [imgMarkdown, imgTitle, imgPath] = image;
    const parsedUrl = url.parse(imgPath, true, true);
    const isUrl = !!(parsedUrl.host && parsedUrl.href);
    const encoder = isUrl ? imageDataURI.encodeFromURL : imageDataURI.encodeFromFile;
    const location = isUrl ? parsedUrl.href : path.join(options.initialDir, imgPath);
    const replaceFn = dataUri => {
      markdown = markdown.replace(imgMarkdown, `![${imgTitle}](${dataUri})`);
    };

    awaits.push(encoder(location).then(replaceFn));
  }

  return Promise.all(awaits)
    .then(() => markdown)
    .catch(console.error);
}

module.exports = function renderStaticMarkup(options) {
  const staticPath = options.static === true ? '_static' : options.static;
  const targetPath = path.resolve(process.cwd(), staticPath);
  const assetsDir = path.join(targetPath, '_assets');

  const awaits = ['css', 'js', 'plugin', 'lib'].map(dir =>
    fs.copyAsync(path.join(options.revealBasePath, dir), path.join(targetPath, dir))
  );

  const staticDirs = typeof options.staticDirs === 'string' ? options.staticDirs.split(',') : options.staticDirs;
  const extraDirs = staticDirs.map(dir => fs.copyAsync(path.join(process.cwd(), dir), path.join(targetPath, dir)));
  awaits.push.apply(awaits, extraDirs);

  const parseSlideAwait = fs.readFileAsync(options.initialPath).then(markdown => markdown.toString());

  const markupAwait = parseSlideAwait
    .then(markdown => embedImages(markdown, options))
    .then(markdown => render(markdown))
    .then(markdown => fs.outputFileAsync(path.join(targetPath, 'index.html'), markdown));

  const highlightAwait = fs.copyAsync(options.highlightThemePath, path.join(targetPath, 'css', 'highlight'));

  awaits.push(markupAwait);
  awaits.push(highlightAwait);

  if (!_.isEmpty(options.scripts)) {
    fs.ensureDirSync(assetsDir);
    const assetAwaits = options.scriptSources.map(asset => fs.copyAsync(asset.path, path.join(assetsDir, asset.name)));
    awaits.push.apply(awaits, assetAwaits);
  }

  if (!_.isEmpty(options.css)) {
    fs.ensureDirSync(assetsDir);
    const assetAwaits = options.cssSources.map(asset => fs.copyAsync(asset.path, path.join(assetsDir, asset.name)));
    awaits.push.apply(awaits, assetAwaits);
  }

  Promise.all(awaits)
    .then(() => console.log(`Wrote static site to ${targetPath}`))
    .catch(console.error);
};
