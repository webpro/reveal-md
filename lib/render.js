const path = require('path');
const _ = require('lodash');
const yamlFrontMatter = require('yaml-front-matter');
const md = require('reveal.js/plugin/markdown/markdown');
const fs = require('fs-extra');
const Mustache = require('mustache');
const defaults = require('./defaults.json');
const {
  getInitialDir,
  getTemplate,
  getPreprocessor,
  getSlideOptions,
  getRevealOptions,
  getThemeUrl,
  getHighlightThemeUrl,
  getScriptPaths,
  getCssPaths,
  getWatch
} = require('./config');

const slidifyProps = ['attributes', 'notesSeparator', 'separator', 'verticalSeparator'];
const getSlidifyOptions = context => _.pick(context, slidifyProps);

const parseYamlFrontMatter = content => {
  const document = yamlFrontMatter.loadFront(content.replace(/^\uFEFF/, ''));
  return {
    yamlOptions: _.omit(document, '__content'),
    markdown: document.__content || content
  };
};

const slidify = (markdown, slidifyOptions = _.pick(defaults, slidifyProps)) => {
  return md.slidify(markdown, slidifyOptions);
};

const render = async (input, extraOptions = {}) => {
  const { yamlOptions, markdown } = parseYamlFrontMatter(input);
  const options = Object.assign(getSlideOptions(yamlOptions), extraOptions);

  const { title } = options;
  const themeUrl = getThemeUrl(options.theme);
  const highlightThemeUrl = getHighlightThemeUrl(options.highlightTheme);
  const revealOptions = Object.assign({}, getRevealOptions(options.revealOptions), yamlOptions.revealOptions);
  const scriptPaths = getScriptPaths(options.scripts, options.assetsDir);
  const cssPaths = getCssPaths(options.css, options.assetsDir);

  const preprocessorFn = getPreprocessor(options.preprocessor);
  const processedMarkdown = await preprocessorFn(markdown, options);

  const slides = slidify(processedMarkdown, getSlidifyOptions(options));

  const context = Object.assign(options, {
    title,
    slides,
    themeUrl,
    highlightThemeUrl,
    scriptPaths,
    cssPaths,
    revealOptionsStr: JSON.stringify(revealOptions),
    watch: getWatch()
  });

  const template = await getTemplate(options.template);

  return Mustache.to_html(template, context);
};

const renderFile = async (filePath, extraOptions) => {
  const content = await fs.readFile(filePath);
  return render(content.toString(), extraOptions);
};

module.exports = async (req, res) => {
  const dir = await getInitialDir();
  const filePath = path.join(dir, req.url.replace(/\?.*/, ''));
  const markup = await renderFile(filePath);
  res.send(markup);
};

module.exports.slidify = slidify;
module.exports.render = render;
module.exports.renderFile = renderFile;
