const path = require('path');
const tryRequire = require('try-require');
const _ = require('lodash');
const fs = require('fs-extra');
const defaults = require('./defaults.json');
const localConfig = tryRequire(path.join(process.cwd(), 'reveal-md.json'));
const revealConfig = tryRequire(path.join(process.cwd(), 'reveal.json'));
const parseArgs = require('yargs-parser');
const url = require('url');
const glob = require('glob');
const { isDirectory, isFile, isAbsoluteURL } = require('./util');

const revealBasePath = path.resolve(require.resolve('reveal.js'), '..', '..');

const alias = {
  h: 'help',
  v: 'version',
  w: 'watch'
};

const cliConfig = parseArgs(process.argv.slice(2), {
  boolean: true,
  alias
});

const mergedConfig = _.defaults({}, cliConfig, localConfig, defaults);

const revealThemes = glob.sync('dist/theme/*.css', { cwd: revealBasePath });

const getAssetPath = (asset, assetsDir = defaults.assetsDir, base) =>
  isAbsoluteURL(asset) ? asset : `.${base || ''}/${assetsDir}/${asset}`;

const getAssetPaths = (assets, assetsDir, base) =>
  (typeof assets === 'string' ? assets.split(',') : assets).map(assetPath => getAssetPath(assetPath, assetsDir, base));

const getPath = () => cliConfig._[0] || '.';

const getInitialDir = async () => {
  const dir = path.resolve(getPath());
  return (await isDirectory(dir)) ? dir : path.dirname(dir);
};

module.exports.getPath = getPath;
module.exports.getInitialDir = getInitialDir;
module.exports.getInitialPath = async () => path.relative(await getInitialDir(), getPath());
module.exports.getAssetsDir = () => mergedConfig.assetsDir;
module.exports.getStaticDir = () => (mergedConfig.static === true ? mergedConfig.staticDir : mergedConfig.static);
module.exports.getHost = () => mergedConfig.host;
module.exports.getPort = () => mergedConfig.port;
module.exports.getWatch = () => Boolean(mergedConfig.watch);
module.exports.getFilesGlob = () => mergedConfig.glob;

module.exports.getOptions = () => mergedConfig;

module.exports.getSlideOptions = options => {
  return _.defaults({}, cliConfig, options, localConfig, defaults);
};

module.exports.getRevealOptions = options => {
  return _.defaults({}, options, revealConfig);
};

module.exports.getThemeUrl = (theme, base = '') => {
  const parsedUrl = url.parse(theme);
  if (parsedUrl.host) {
    return theme;
  } else {
    const revealTheme = revealThemes.find(
      themePath => path.basename(themePath).replace(path.extname(themePath), '') === theme
    );
    return revealTheme ? base + '/' + revealTheme : getAssetPath(theme);
  }
};

module.exports.getHighlightThemeUrl = highlightTheme => '/css/highlight/' + highlightTheme + '.css';

module.exports.getScriptPaths = (scripts, assetsDir, base) => getAssetPaths(scripts, assetsDir, base);
module.exports.getCssPaths = (css, assetsDir, base) => getAssetPaths(css, assetsDir, base);

module.exports.getTemplate = async template => {
  const base = defaults.template === template ? __dirname : process.cwd();
  const contents = await fs.readFile(path.join(base, template));
  return contents.toString();
};

module.exports.getListingTemplate = async template => {
  const base = defaults.listingTemplate === template ? __dirname : process.cwd();
  const contents = await fs.readFile(path.join(base, template));
  return contents.toString();
};

module.exports.getFaviconPath = async () => {
  const initialDir = await getInitialDir();
  const faviconPath = path.join(initialDir, 'favicon.ico');
  const hasFavicon = (await fs.pathExists(faviconPath)) && isFile(faviconPath);
  return hasFavicon ? faviconPath : path.join(__dirname, 'favicon.ico');
};

module.exports.getPreprocessor = preprocessor => {
  if (preprocessor && !path.isAbsolute(preprocessor)) {
    preprocessor = path.join(process.cwd(), preprocessor);
  }
  return preprocessor ? require(preprocessor) : _.identity;
};

module.exports.getPuppeteerLaunchConfig = () => {
  const { puppeteerLaunchArgs, puppeteerChromiumExecutable } = mergedConfig;
  return {
    args: puppeteerLaunchArgs ? puppeteerLaunchArgs.split(' ') : [],
    executablePath: puppeteerChromiumExecutable || null
  };
};

module.exports.getPageOptions = printSize => {
  if (printSize) {
    const dimensions = printSize.match(/^([\d.]+)x([\d.]+)([a-z]*)$/);
    if (dimensions) {
      const [width, height, unit] = dimensions.slice(1);
      return { width: `${width}${unit}`, height: `${height}${unit}` };
    }
    return { format: printSize };
  } else if (revealConfig && revealConfig.width && revealConfig.height) {
    return { width: revealConfig.width, height: revealConfig.height };
  } else {
    return { width: 960, height: 700 };
  }
};
