const fs = require('fs-extra'),
  debug = require('debug')('reveal-md'),
  Mustache = require('mustache'),
  got = require('got'),
  glob = require('glob'),
  yamlFrontMatter = require('yaml-front-matter'),
  md = require('reveal.js/plugin/markdown/markdown'),
  _ = require('lodash'),
  parseOptions = require('./options').parseOptions;
  imageDataURI = require('image-data-uri');

function parseYamlFrontMatter(content) {
  const document = yamlFrontMatter.loadFront(content);
  return {
    options: _.omit(document, '__content'),
    markdown: document.__content || content
  };
}

function getSlidifyOptions(options) {
  return _.pick(options, [
    'attributes',
    'notesSeparator',
    'separator',
    'verticalSeparator'
  ]);
}

function parseSlides(markdown, options) {
  const yaml = parseYamlFrontMatter(markdown);
  const view = parseOptions(_.merge({}, options, yaml.options));
  const slidifyOptions = getSlidifyOptions(view);
  const processedMarkdown = view.preprocessorFn(yaml.markdown, view);
  return {
    view,
    slides: md.slidify(processedMarkdown, slidifyOptions)
  };
}

function inlinePictures(markdown){
  const regex = /!\[.*?\]\((.*?)\)/gi;
  const images = markdown.match(regex)||[];
  let promises = [];
  images.forEach((match)=>{
    let parts = [];
    parts.push(match.match(/^!\[.*?\]/gi));
    parts.push(match.match(/\]\((.*?)\)$/gi));
    let href = parts[1][0].substring(2, parts[1][0].length - 1);
    promises.push(imageDataURI.encodeFromFile(href).then(datauri=>{
      markdown = markdown.replace(match,parts[0]+"("+datauri+")");
    },err=>{
      console.log("Not inlined: "+ match);
  }))});

  return new Promise((resolve,reject)=>{
    Promise.all(promises).then(()=>{
        resolve(markdown);
      })
  });
}

function render(markdown, options) {

  const slides = parseSlides(markdown, options);

  const view = _.extend(slides.view, {
    slides: slides.slides,
    scripts: slides.view.scripts
  });

  debug(`Rendering ${options.relativePath} with %O from %O`, view, markdown);

  return Mustache.to_html(view.template(), view);
}

function renderMarkdownAsSlides(req, res) {

  const options = res.locals.options;

  const readMarkdown = options.url
    ? got(options.url).then(response => response.body)
    : fs.readFileAsync(options.relativePath).then(markdown => markdown.toString());

  readMarkdown.then(markdown => render(markdown, options)).then(markup => res.send(markup));
}

function renderMarkdownFileListing(req, res) {

  const options = res.locals.options;
  const list = glob.sync('**/*.md', {
    cwd: options.baseDir,
    ignore: 'node_modules/**'
  }).map(filePath => `<a href="${filePath}">${filePath}</a>`);

  const markup = Mustache.to_html(options.templateListing(), {
    themeUrl: options.themeUrl,
    title: options.title,
    listing: list.join('<br>')
  });

  res.send(markup);
}

module.exports = {
  render,
  renderMarkdownAsSlides,
  renderMarkdownFileListing,
  parseSlides,
  inlinePictures
};
