const fs = require('fs-extra'),
  path = require('path'),
  render = require('./render').render,
  imageDataURI = require('image-data-uri'),
  _ = require('lodash');

module.exports = function renderStaticMarkup(options) {

  /* eslint-disable no-console */

  const staticPath = options.static === true ? '_static' : options.static;
  const targetPath = path.resolve(process.cwd(), staticPath);
  const assetsDir = path.join(targetPath, 'assets');

  const awaits = ['css', 'js', 'plugin', 'lib'].map(dir => fs.copyAsync(path.join(options.revealBasePath, dir), path.join(targetPath, dir)));

  const markupAwait = fs.readFileAsync(options.relativePath)
    .then(markdown => embedImages(markdown.toString(), options))
    .then(markdown => render(markdown.toString(), options))
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

function embedImages(markdown){
  const mdImgRegex = /!\[.*?\]\((.*?)\)/gi;
  const images = markdown.match(mdImgRegex)||[];
  let allPromises = [];
  images.forEach((match)=>{
    
    let imgTextPart = match.match(/^!\[.*?\]/gi);
    let imgPathPart = match.match(/\]\((.*?)\)$/gi);
    let href = imgPathPart[0].substring(2, imgPathPart[0].length - 1);
    
    allPromises.push(imageDataURI.encodeFromFile(href).then(datauri=>{
      markdown = markdown.replace(match,imgTextPart+'('+datauri+')');
    },()=>{
      //console.log("Not inlined: "+ match);
    }));
  });

  return new Promise((resolve)=>{
    Promise.all(allPromises).then(()=>{
      resolve(markdown);
    });
  });
}

