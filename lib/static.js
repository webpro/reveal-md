'use strict';
const fs = require('fs-extra'),
  path = require('path'),
  render = require('./render').render,
  imageDataURI = require('image-data-uri'),
  _ = require('lodash');

const mdImageRE = /!\[([^\]]*)\]\(([^\)]+)\)/gi;

function embedImages(markdown, options) {

  /* eslint-disable no-console, no-cond-assign */

  let image;
  const awaits = [];

  while(image = mdImageRE.exec(markdown)) {
    const imgMarkdown = image[0],
      imgTitle = image[1],
      imgPath = image[2];
    awaits.push(imageDataURI.encodeFromFile(path.join(options.basePath, imgPath)).then(dataUri => {
      markdown = markdown.replace(imgMarkdown, `![${imgTitle}](${dataUri})`);
    }));
  }

  return Promise.all(awaits).then(() => markdown).catch(console.error);

}

module.exports = function renderStaticMarkup(options) {

  /* eslint-disable no-console */

  const staticPath = options.static === true ? '_static' : options.static;
  const targetPath = path.resolve(process.cwd(), staticPath);
  const assetsDir = path.join(targetPath, 'assets');

  const awaits = ['css', 'js', 'plugin', 'lib'].map(dir => fs.copyAsync(path.join(options.revealBasePath, dir), path.join(targetPath, dir)));
  const extra_dirs = options.staticDirs.map(dir => fs.copyAsync(path.join(process.cwd(), dir), path.join(targetPath, dir)));
  awaits.concat(extra_dirs);

  const markupAwait = fs.readFileAsync(options.relativePath)
    .then(markdown => markdown.toString())
    .then(markdown => embedImages(markdown, options))
    .then(markdown => render(markdown, options))
    .then(markdown => fs.outputFileAsync(path.join(targetPath, 'index.html'), markdown));

  const highlightAwait = fs.copyAsync(options.highlightThemePath, path.join(targetPath, 'css', 'highlight'));

  awaits.push(markupAwait);
  awaits.push(highlightAwait);

  if(!_.isEmpty(options.scripts)) {
    fs.ensureDirSync(assetsDir);
    const assetAwaits = options.scriptSources.map(asset => fs.copyAsync(asset.path, path.join(assetsDir, asset.name)));
    awaits.concat(assetAwaits);
  }

  if(!_.isEmpty(options.css)) {
    fs.ensureDirSync(assetsDir);
    const assetAwaits = options.cssSources.map(asset => fs.copyAsync(asset.path, path.join(assetsDir, asset.name)));
    awaits.concat(assetAwaits);
  }

  Promise.all(awaits).then(() => console.log(`Wrote static site to ${targetPath}`)).catch(console.error);

};
