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
const { isDirectory } = require('./util');

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

const revealThemes = glob.sync('css/theme/*.css', { cwd: revealBasePath });

const getAssetPath = (asset, assetsDir = defaults.assetsDir) => `${assetsDir}/${asset}`;

const getAssetPaths = (assets, assetsDir) => {
  return (typeof assets === 'string' ? assets.split(',') : assets).map(assetPath => getAssetPath(assetPath, assetsDir));
};

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

module.exports.getOptions = () => mergedConfig;

module.exports.getSlideOptions = options => {
  return _.defaults({}, options, cliConfig, localConfig, defaults);
};

module.exports.getRevealOptions = options => {
  return _.defaults({}, options, revealConfig);
};

module.exports.getThemeUrl = theme => {
  const parsedUrl = url.parse(theme);
  if (parsedUrl.host) {
    return theme;
  } else {
    const revealTheme = revealThemes.find(
      themePath => path.basename(themePath).replace(path.extname(themePath), '') === theme
    );
    return revealTheme || getAssetPath(theme);
  }
};

module.exports.getHighlightThemeUrl = highlightTheme => '/css/highlight/' + highlightTheme + '.css';

module.exports.getScriptPaths = (scripts, assetsDir) => getAssetPaths(scripts, assetsDir);
module.exports.getCssPaths = (css, assetsDir) => getAssetPaths(css, assetsDir);

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

module.exports.getPreprocessor = preprocessor => {
  if (preprocessor && !path.isAbsolute(preprocessor)) {
    preprocessor = path.join(process.cwd(), preprocessor);
  }
  return preprocessor ? require(preprocessor) : _.identity;
};

module.exports.getPuppeteerLaunchConfig = () => {
  const { puppeteerLaunchArgs, puppeteerChromiumExecutable } = mergedConfig;
  return {
    args: puppeteerLaunchArgs ? puppeteerLaunchArgs.split(' ') : null,
    executablePath: puppeteerChromiumExecutable || null
  };
};
