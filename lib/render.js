import _ from 'lodash';
import { parseYamlFrontMatter } from './util.js';
import { readFile } from 'node:fs/promises';
import Mustache from 'mustache';
import {
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
} from './config.js';
import path from 'node:path';

const slidifyAttributeNames = {
  notesSeparator: 'data-separator-notes',
  separator: 'data-separator',
  verticalSeparator: 'data-separator-vertical'
};

function sanitize(entry) {
  if (entry.includes('..')) {
    entry = sanitize(entry.replace('..', ''));
  }
  return entry;
}

// Exports ---------------------------------------------------------------------

/**
 * Renders the given markdown content into HTML.
 * @param {string} fullMarkdown - The contents of the markdown file, including a possible YAML front matter
 * @param {Object} extraOptions - Additional options (mostly used by tests)
 * @returns {string} The rendered HTML compatible with reveal.js
 */
export const render = async (fullMarkdown, extraOptions = {}) => {
  const { yamlOptions, markdown: contentOnlyMarkdown } = parseYamlFrontMatter(fullMarkdown);
  const options = Object.assign(getSlideOptions(yamlOptions), extraOptions);

  const { title } = options;
  const themeUrl = getThemeUrl(options.theme, options.assetsDir, options.base);
  const highlightThemeUrl = getHighlightThemeUrl(options.highlightTheme);
  const scriptPaths = getScriptPaths(options.scripts, options.assetsDir, options.base);
  const cssPaths = getCssPaths(options.css, options.assetsDir, options.base);

  const revealOptions = Object.assign({}, getRevealOptions(options.revealOptions), yamlOptions.revealOptions);

  const slidifyOptions = _.pick(options, Object.keys(slidifyAttributeNames));
  let slidifyAttributes = [];
  for (const [key, value] of Object.entries(slidifyOptions)) {
    const escaped_value = value.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
    slidifyAttributes.push(`${slidifyAttributeNames[key]}="${escaped_value}"`);
  }

  const preprocessorFn = await getPreprocessor(options.preprocessor);
  const processedMarkdown = await preprocessorFn(contentOnlyMarkdown, options);

  const revealOptionsStr = JSON.stringify(revealOptions);
  const mermaidOptionsStr = options.mermaid === false ? undefined : JSON.stringify(options.mermaid);

  const template = await getTemplate(options.template);
  const context = Object.assign(options, {
    title,
    slidifyAttributes: slidifyAttributes.join(' '),
    markdown: processedMarkdown,
    themeUrl,
    highlightThemeUrl,
    scriptPaths,
    cssPaths,
    revealOptionsStr,
    mermaidOptionsStr,
    watch: getWatch()
  });
  const markup = Mustache.render(template, context);

  return markup;
};

export const renderFile = async (filePath, extraOptions) => {
  try {
    const content = await readFile(filePath);
    return render(content.toString(), extraOptions);
  } catch (e) {
    return render('File not found.', extraOptions);
  }
};

export default async (req, res) => {
  const dir = await getInitialDir();
  const filePath = path.join(dir, sanitize(decodeURIComponent(req.url)).replace(/\?.*/, ''));
  const markup = await renderFile(filePath);
  res.send(markup);
};
