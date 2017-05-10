'use strict';
const fs = require('fs-extra'),
  path = require('path'),
  render = require('./render').render,
  parseYamlFrontMatter = require('./render').parseYamlFrontMatter,
  imageDataURI = require('image-data-uri'),
  _ = require('lodash'),
  Mustache = require('mustache'),
  marked = require('marked'),
  inline = require('inline-source');

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

function renderStaticMarkup(options) {

  /* eslint-disable no-console */

  const staticPath = options.static === true ? '_static' : options.static;
  const targetPath = path.resolve(process.cwd(), staticPath);
  const assetsDir = path.join(targetPath, 'assets');

  const awaits = ['css', 'js', 'plugin', 'lib'].map(dir => fs.copyAsync(path.join(options.revealBasePath, dir), path.join(targetPath, dir)));

  const markupAwait = renderMarkup(options,path.join(targetPath, 'index.html'));
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

}

function renderStandaloneMarkup(options) {

  /* eslint-disable no-console */
  const outputName = options.relativePath.replace('.md','-reveal')+'.html';
  renderMarkup(options,outputName)
    .then(() => console.log(`Wrote stand alone pressentation to ${outputName}`)).catch(console.error);
}


function renderMarkup(options,destinationFile){
  return fs.readFileAsync(options.relativePath)
    .then(markdown => embedImages(markdown.toString(), options))
    .then(markdown => render(markdown.toString(), options))
    .then(markdown => inlineCustomFiles(markdown))
    .then(markdown => fs.outputFileAsync(destinationFile, markdown));
}


function renderPrintout(options){
  /* eslint-disable no-console */
  const outputName = options.relativePath.replace('.md','-printout')+'.html';
  fs.readFileAsync(options.relativePath)
    .then(markdown => embedImages(markdown.toString(), options))
    .then(markdown => renderMd(markdown.toString(), options))
    .then(markdown => fs.outputFileAsync(outputName, markdown))
    .then(() => console.log(`Wrote printout to ${outputName}`)).catch(console.error);
}

function inlineCustomFiles(html){
  return new Promise((resolve,reject)=>{
    inline(html, {compress: true}, function (err, result) {
      console.log(JSON.stringify(err));
      resolve(result||html);
    });
  })

}

function parseAsRegularMarkdown(markdown) {
  const yaml = parseYamlFrontMatter(markdown);
  return marked(yaml.markdown);
}


function renderMd(markdown,options) {
  const markup = parseAsRegularMarkdown(markdown);
  const view = {
    slides: markup
  };
  return Mustache.to_html(options.template(), view);
}

module.exports ={
  renderStaticMarkup,
  renderStandaloneMarkup,
  renderPrintout
};
