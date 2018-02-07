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
  if (preprocessor && !_.startsWith(preprocessor, '/')) {
    preprocessor = path.join(process.cwd(), preprocessor);
  }
  return preprocessor ? require(preprocessor) : markdown => Promise.resolve(markdown);
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
  'watch',
  'notesSeparator'
];

function parseOptions(args) {
  const options = _.pick(args, optionList);

  if (_.has(args, 'args.0')) _.extend(options, parsePath(args.args[0]));

  options.defaults = defaults;
  options.defaults.base = () => `${options.base()}`
  options.defaults.themePath = parseThemeArg(defaults.theme);
  options.defaults.themeUrl = () => getThemeUrl(defaults);
  options.defaults.revealOptionsStr = () => JSON.stringify(defaults.revealOptions);
  options.defaults.highlightThemeUrl = () => `${options.base()}/css/highlight/${options.defaults.highlightTheme}.css`;
  options.defaults.revealOptionsStr = () => JSON.stringify(options.defaults.revealOptions);

  options.themePath = args.theme ? parseThemeArg(args.theme) : undefined;
  options.scriptPaths = parseAssetsArg(args.scripts);
  options.scriptSources = parseAssetsPath(args.scripts);
  options.cssPaths = parseAssetsArg(args.css);
  options.cssSources = parseAssetsPath(args.css);
  options.title = args.title;
  options.separator = args.separator;
  options.verticalSeparator = args.verticalSeparator;
  options.highlightTheme = args.highlightTheme;
  options.preprocessorFn = parsePreprocessorArg(args.preprocessor);
  options.staticDirs = args.staticDirs;

  options.revealBasePath = revealBasePath;
  options.highlightThemePath = highlightThemePath;

  options.base = () => (options.static ? '.' : '');
  options.templateSlides = () => fs.readFileSync(options.template || templatePath).toString();
  options.templateListing = () => fs.readFileSync(options.listingTemplate || templateListingPath).toString();
  if( options.themePath ) {
      options.themeUrl = () => getThemeUrl(options);
  }
  if( options.highlightTheme ) {
    options.highlightThemeUrl = () => `${options.base()}/css/highlight/${options.highlightTheme}.css`;
  }
  if( options.revealOptions ) {
    options.revealOptionsStr = () => JSON.stringify(options.revealOptions);
  }

  return options;
}

module.exports = {
  parsePath,
  parseOptions
};
