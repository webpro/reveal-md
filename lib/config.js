import { createRequire } from 'node:module';
import _ from 'lodash';
import { readFile } from 'node:fs/promises';
import * as fs from 'fs-extra';
import parseArgs from 'yargs-parser';
import path from 'node:path';
import url from 'node:url';
import { globSync } from 'glob';
import { isDirectory, isFile, isAbsoluteURL, tryReadJson5Configs, loadJSON } from './util.js';

const require = createRequire(import.meta.url);

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export const defaults = loadJSON(path.join(__dirname, 'defaults.json'));
export const revealBasePath = path.join(require.resolve('reveal.js'), '..', '..');
export const mermaidBasePath = path.join(require.resolve('mermaid'), '..', '..');
export const highlightThemePath = path.resolve(require.resolve('highlight.js'), '..', '..', 'styles');

const localConfig = tryReadJson5Configs(
  path.join(process.cwd(), 'reveal-md.json5'),
  path.join(process.cwd(), 'reveal-md.json')
);
const revealConfig = tryReadJson5Configs(
  path.join(process.cwd(), 'reveal.json5'),
  path.join(process.cwd(), 'reveal.json')
);

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

const revealThemes = globSync('dist/theme/*.css', { cwd: revealBasePath, posix: true });

const getAssetPath = (asset, assetsDir = defaults.assetsDir, base) =>
  isAbsoluteURL(asset) ? asset : `${base || ''}/${assetsDir}/${asset}`;

const getAssetPaths = (assets, assetsDir, base) =>
  (typeof assets === 'string' ? assets.split(',') : assets).map(assetPath => getAssetPath(assetPath, assetsDir, base));

// Exports ---------------------------------------------------------------------

export const getPath = () => cliConfig._[0] || '.';

export const getInitialDir = async () => {
  const dir = path.resolve(getPath());
  return (await isDirectory(dir)) ? dir : path.dirname(dir);
};

export const getInitialPath = async () => path.relative(await getInitialDir(), getPath());
export const getAssetsDir = () => mergedConfig.assetsDir;
export const getStaticDir = () => (mergedConfig.static === true ? mergedConfig.staticDir : mergedConfig.static);
export const getHost = () => mergedConfig.host;
export const getPort = () => mergedConfig.port;
export const getWatch = () => Boolean(mergedConfig.watch);
export const getFilesGlob = () => mergedConfig.glob;

export const getOptions = () => mergedConfig;

export const getSlideOptions = options => {
  return _.defaultsDeep({}, cliConfig, options, localConfig, defaults);
};

export const getRevealOptions = options => {
  return _.defaults({}, options, revealConfig, cliConfig);
};

export const getThemeUrl = (theme, assetsDir, base) => {
  const parsedUrl = url.parse(theme);
  if (parsedUrl.host) {
    return theme;
  } else {
    const revealTheme = revealThemes.find(
      themePath => path.basename(themePath).replace(path.extname(themePath), '') === theme
    );
    return revealTheme ? `${base || ''}/${revealTheme}` : getAssetPath(theme, assetsDir, base);
  }
};

export const getHighlightThemeUrl = highlightTheme => '/css/highlight/' + highlightTheme + '.css';

export const getScriptPaths = (scripts, assetsDir, base) => getAssetPaths(scripts, assetsDir, base);
export const getCssPaths = (css, assetsDir, base) => getAssetPaths(css, assetsDir, base);

export const getTemplate = async template => {
  const base = defaults.template === template ? __dirname : process.cwd();
  const contents = await readFile(path.join(base, template));
  return contents.toString();
};

export const getListingTemplate = async template => {
  const base = defaults.listingTemplate === template ? __dirname : process.cwd();
  const contents = await readFile(path.join(base, template));
  return contents.toString();
};

export const getFaviconPath = async () => {
  const initialDir = await getInitialDir();
  const faviconPath = path.join(initialDir, 'favicon.ico');
  const hasFavicon = (await fs.pathExists(faviconPath)) && isFile(faviconPath);
  return hasFavicon ? faviconPath : path.join(__dirname, 'favicon.ico');
};

export const getPreprocessor = async preprocessor => {
  if (preprocessor) {
    const { default: defaultFunc } = await import(preprocessor);
    return defaultFunc;
  }

  return _.identity;
};

export const getPuppeteerLaunchConfig = () => {
  const { puppeteerLaunchArgs, puppeteerChromiumExecutable } = mergedConfig;
  return {
    args: puppeteerLaunchArgs ? puppeteerLaunchArgs.split(' ') : [],
    executablePath: puppeteerChromiumExecutable || null
  };
};

export const getPageOptions = printSize => {
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
