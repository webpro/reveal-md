const fs = require('fs-extra');
const debug = require('debug')('reveal-md');
const Mustache = require('mustache');
const got = require('got');
const glob = require('glob');
const yamlFrontMatter = require('yaml-front-matter');
const md = require('reveal.js/plugin/markdown/markdown');
const _ = require('lodash');
const parseOptions = require('./options').parseOptions;

function parseYamlFrontMatter(content) {
  const document = yamlFrontMatter.loadFront(content.replace(/^\uFEFF/, ''));
  return {
    options: _.omit(document, '__content'),
    markdown: document.__content || content
  };
}

function getSlidifyOptions(options) {
  return _.pick(options, ['attributes', 'notesSeparator', 'separator', 'verticalSeparator']);
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

function render(markdown, options) {
  const slides = parseSlides(markdown, options);
  const view = _.extend(slides.view, {
    slides: slides.slides,
    scripts: slides.view.scripts
  });
  view.print = view.print || _.get(options, 'query.print-pdf') !== undefined;

  debug(`Rendering ${options.relativePath} with %O from %O`, view, markdown);

  return Mustache.to_html(view.templateSlides(), view);
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
  const list = glob
    .sync('**/*.md', {
      cwd: options.baseDir,
      ignore: 'node_modules/**'
    })
    .map(filePath => `<a href="${filePath}">${filePath}</a>`);

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
  parseYamlFrontMatter
};
