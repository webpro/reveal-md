const fs = require('fs');
const path = require('path');
const glob = require('glob');
const url = require('url');
const _ = require('lodash');
const debug = require('debug')('reveal-md');
const defaults = require('./defaults.json');

const optionList = [
  'disableAutoOpen',
  'highlightTheme',
  'host',
  'port',
  'print',
  'preprocessor',
  'revealOptions',
  'template',
  'listingTemplate',
  'scripts',
  'css',
  'separator',
  'static',
  'staticDirs',
  'theme',
  'title',
  'verticalSeparator',
  'watch',
  'notesSeparator',
  'noPhantom'
];

let local = {};
try {
  local = require(path.join(process.cwd(), 'reveal-md.json'));
} catch (err) {
  debug(err.message);
}
debug('localOptions %O', local);

let revealOptions = {};
try {
  revealOptions = require(path.join(process.cwd(), 'reveal.json'));
} catch (err) {
  debug(err.message);
}
debug('revealOptions %O', revealOptions);

defaults.base = '';
defaults.revealBasePath = path.resolve(require.resolve('reveal.js'), '..', '..');
defaults.highlightThemePath = path.resolve(require.resolve('highlight.js'), '..', '..', 'styles');
defaults.templatePath = path.join(__dirname, defaults.template);
defaults.templateListingPath = path.join(__dirname, defaults.listingTemplate);
defaults.templateSlides = fs.readFileSync(defaults.templatePath).toString();
defaults.templateListing = () => fs.readFileSync(defaults.templateListingPath).toString();
defaults.revealOptionsStr = () => JSON.stringify(defaults.revealOptions);
defaults.themeUrl = 'css/theme/' + defaults.theme + '.css';
defaults.highlightThemeUrl = '/css/highlight/' + defaults.highlightTheme + '.css';
defaults.preprocessorFn = markdown => Promise.resolve(markdown);

const revealThemes = glob.sync('css/theme/*.css', { cwd: defaults.revealBasePath });

const config = {
  revealOptions,
  local: parseOptions(local),
  defaults
};

const setArgOptions = options => {
  config.args = parseOptions(_.pick(options, optionList));
  config.args.initialPath = options.args[0] || '.';
  config.args.initialDir = path.dirname(config.args.initialPath);
  return _.defaults({}, config.args, config.local, config.defaults);
};

function getOptions() {
  return _.defaults({}, config.args, config.local, config.defaults);
}

function getSlideOptions(yamlOptions, extraOptions) {
  const options = _.defaults(
    {},
    config.args,
    parseOptions(yamlOptions),
    parseOptions(extraOptions),
    config.local,
    config.defaults
  );
  options.themeUrl = (options.base + '/' + options.themeUrl).replace(/^\.\/http/, 'http');
  return options;
}

function parseOptions(options) {
  if (options.static) {
    options.base = '.';
  }
  if (options.theme) {
    options.themeUrl = parseTheme(options);
  }
  if (options.highlightTheme) {
    options.highlightThemeUrl = '/css/highlight/' + options.highlightTheme + '.css';
  }
  if (options.template && options.template !== defaults.template) {
    options.templateSlides = fs.readFileSync(options.template).toString();
  }
  if (options.listingTemplate && options.listingTemplate !== defaults.listingTemplate) {
    options.templateListing = fs.readFileSync(options.listingTemplate).toString();
  }
  if (options.revealOptions) {
    options.revealOptionsStr = JSON.stringify(options.revealOptions);
  }
  if (options.preprocessor) {
    options.preprocessorFn = parsePreprocessor(options.preprocessor);
  }
  if (options.scripts) {
    options.scriptPaths = getAssetPaths(options.scripts);
    options.scriptSources = getAssetSourcePaths(options.scripts);
  }
  if (options.css) {
    options.cssPaths = getAssetPaths(options.css);
    options.cssSources = getAssetSourcePaths(options.css);
  }
  return options;
}

function parsePreprocessor(preprocessor) {
  if (preprocessor && !_.startsWith(preprocessor, '/')) {
    preprocessor = path.join(process.cwd(), preprocessor);
  }
  return preprocessor ? require(preprocessor) : defaults.preprocessorFn;
}

function parseTheme(options) {
  const { theme, static, base = '' } = options;
  const parsedUrl = url.parse(theme);
  if (parsedUrl.host) {
    return theme;
  } else {
    const revealTheme = revealThemes.find(
      themePath => path.basename(themePath).replace(path.extname(themePath), '') === theme
    );
    return revealTheme || (static ? theme : getAssetPath(theme));
  }
}

const getAssetPath = asset => `_assets/${asset}`;

const getAssetPaths = assets => (typeof assets === 'string' ? assets.split(',') : []).map(getAssetPath);

const getAssetSourcePath = asset => ({
  path: path.resolve(process.cwd(), asset),
  name: asset
});

const getAssetSourcePaths = assets => (typeof assets === 'string' ? assets.split(',') : []).map(getAssetSourcePath);

module.exports = {
  setArgOptions,
  getOptions,
  getSlideOptions
};
