'use strict';
const fs = require('fs-extra');
const path = require('path');
const render = require('./render').render;
const parseYamlFrontMatter = require('./render').parseYamlFrontMatter;
const imageDataURI = require('image-data-uri');
const _ = require('lodash');

const mdImageRE = /!\[([^\]]*)\]\(([^)]+)\)/gi;

function embedImages(markdown, options) {
  let image;
  const awaits = [];

  while ((image = mdImageRE.exec(markdown))) {
    const imgMarkdown = image[0],
      imgTitle = image[1],
      imgPath = image[2];
    awaits.push(
      imageDataURI.encodeFromFile(path.join(options.basePath, imgPath)).then(dataUri => {
        markdown = markdown.replace(imgMarkdown, `![${imgTitle}](${dataUri})`);
      })
    );
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
  const extraDirs = staticDirs.map(dir =>
    fs.copyAsync(path.join(process.cwd(), dir), path.join(targetPath, dir))
  );
  awaits.push.apply(awaits, extraDirs);

  const parseSlideAwait = fs
    .readFileAsync(options.relativePath)
    .then(markdown => markdown.toString())
    .then(markdown => {
      const yaml = parseYamlFrontMatter(markdown);
      Object.assign(options, yaml.options);
      return yaml.markdown;
    });

  const markupAwait = parseSlideAwait
    .then(markdown => embedImages(markdown, options))
    .then(markdown => render(markdown, options))
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
