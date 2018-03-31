const fs = require('fs-extra');
const path = require('path');
const debug = require('debug')('reveal-md');
const Mustache = require('mustache');
const got = require('got');
const url = require('url');
const glob = require('glob');
const yamlFrontMatter = require('yaml-front-matter');
const md = require('reveal.js/plugin/markdown/markdown');
const _ = require('lodash');
const { getOptions, getSlideOptions } = require('./options');

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

function parseSlides(markdown, extraOptions) {
  const yaml = parseYamlFrontMatter(markdown);
  const view = getSlideOptions(yaml.options, extraOptions);
  const slidifyOptions = getSlidifyOptions(view);

  return view.preprocessorFn(yaml.markdown, view).then(processedMarkdown => {
    view.slides = md.slidify(processedMarkdown, slidifyOptions);
    return view;
  });
}

function render(markdown, extraOptions = {}) {
  return parseSlides(markdown, extraOptions).then(view => {
    view.print = view.print || _.get({}, 'query.print-pdf') !== undefined;

    debug(`Rendering ${extraOptions.initialPath} with %O from %O`, view, markdown);

    return Mustache.to_html(view.templateSlides, view);
  });
}

function renderMarkdown(req, res) {
  const location = req.url.replace(/^\//, '');
  const parsedUrl = url.parse(location, true, true);
  const filePath = path.join(process.cwd(), location.replace(/(\?.*)/, ''));

  debug({
    filePath,
    parsedUrl
  });

  const readMarkdown =
    parsedUrl.host && parsedUrl.href
      ? got(parsedUrl.href).then(response => response.body)
      : fs.readFileAsync(filePath).then(markdown => markdown.toString());

  readMarkdown.then(markdown => render(markdown)).then(markup => res.send(markup));
}

function renderMarkdownFileListing(req, res) {
  const options = getOptions();
  const list = glob
    .sync('**/*.md', {
      cwd: options.initialPath,
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
  renderMarkdown,
  renderMarkdownFileListing,
  parseSlides,
  parseYamlFrontMatter
};
