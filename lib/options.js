const fs = require('fs');
const path = require('path');
const glob = require('glob');
const url = require('url');
const _ = require('lodash');
const defaults = require('./defaults.json');

const revealBasePath = path.resolve(require.resolve('reveal.js'), '..', '..');
const highlightThemePath = path.resolve(require.resolve('highlight.js'), '..', '..', 'styles');
const templatePath = path.join(__dirname, 'template', 'reveal.html');
const templateListingPath = path.join(__dirname, 'template', 'listing.html');

const revealThemes = glob.sync('css/theme/*.css', { cwd: revealBasePath });

function parsePath(pathArg, baseDir) {
  const opts = {};
  if (pathArg === 'demo') {
    opts.basePath = path.join(__dirname, '..', 'demo');
    opts.baseDir = opts.basePath;
  } else if (pathArg) {
    const parsedUrl = url.parse(pathArg, true, true);
    const filePath = path.join(baseDir || process.cwd(), parsedUrl.pathname);
    opts.query = parsedUrl.query;
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        opts.basePath = path.dirname(filePath);
        opts.baseName = path.basename(filePath);
        opts.relativePath = path.relative(process.cwd(), filePath);
      } else if (stat.isDirectory()) {
        opts.baseDir = filePath;
      }
    } else {
      if (parsedUrl.host) {
        opts.url = parsedUrl.href;
      } else {
        opts.basePath = process.cwd();
      }
    }
  }
  return opts;
}

function getThemeUrl(options) {
  const parsedUrl = typeof options.themePath === 'string' && url.parse(options.themePath);
  if (parsedUrl.host) {
    return parsedUrl.href;
  } else {
    return `${options.base()}/${options.themePath}`;
  }
}

function parseThemeArg(theme) {
  const parsedUrl = url.parse(theme);
  if (parsedUrl.host) {
    return theme;
  } else {
    const revealTheme = revealThemes.find(
      themePath => path.basename(themePath).replace(path.extname(themePath), '') === theme
    );
    return revealTheme || parseAssetsArg(theme);
  }
}

function parseAssetsArg(assets) {
  return (typeof assets === 'string' ? assets.split(',') : []).map(asset => `_assets/${asset}`);
}

function parseAssetsPath(assets) {
  return (typeof assets === 'string' ? assets.split(',') : []).map(asset => ({
    path: path.resolve(process.cwd(), asset),
    name: asset
  }));
}

function parsePreprocessorArg(preprocessor) {
  return preprocessor ? require(path.join(process.cwd(), preprocessor)) : _.identity;
}

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
  'watch'
];

function parseOptions(args) {
  const options = _.pick(args, optionList);

  if (_.has(args, 'args.0')) _.extend(options, parsePath(args.args[0]));

  options.themePath = parseThemeArg(args.theme || defaults.theme);
  options.scriptPaths = parseAssetsArg(args.scripts);
  options.scriptSources = parseAssetsPath(args.scripts);
  options.cssPaths = parseAssetsArg(args.css);
  options.cssSources = parseAssetsPath(args.css);
  options.title = args.title || defaults.title;
  options.separator = args.separator || defaults.separator;
  options.verticalSeparator = args.verticalSeparator || defaults.verticalSeparator;
  options.highlightTheme = args.highlightTheme || defaults.highlightTheme;
  options.preprocessorFn = parsePreprocessorArg(args.preprocessor);
  options.staticDirs = args.staticDirs || defaults.staticDirs;

  options.revealBasePath = revealBasePath;
  options.highlightThemePath = highlightThemePath;

  options.base = () => (options.static ? '.' : '');
  options.templateSlides = () => fs.readFileSync(options.template || templatePath).toString();
  options.templateListing = () => fs.readFileSync(options.listingTemplate || templateListingPath).toString();
  options.themeUrl = () => getThemeUrl(options);
  options.highlightThemeUrl = () => `${options.base()}/css/highlight/${options.highlightTheme}.css`;
  options.revealOptionsStr = () => JSON.stringify(options.revealOptions || defaults.revealOptions);

  return options;
}

module.exports = {
  parsePath,
  parseOptions
};
