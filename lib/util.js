import * as fs from 'node:fs';
import path from 'node:path';
import _ from 'lodash';
import yamlFrontMatter from 'yaml-front-matter';
import { globSync } from 'glob';
import Markdown from 'reveal.js/plugin/markdown/markdown.js';
import { promisify } from 'node:util';

const stat = promisify(fs.stat);

// Exports ---------------------------------------------------------------------

export const md = (() => {
  return Markdown();
})();

export const isDirectory = _.memoize(async dir => {
  const stats = await stat(path.resolve(dir));
  return stats.isDirectory();
});

export const isFile = _.memoize(async dir => {
  const stats = await stat(path.resolve(dir));
  return stats.isFile();
});

export const parseYamlFrontMatter = content => {
  const document = yamlFrontMatter.loadFront(content.replace(/^\uFEFF/, ''));
  return {
    yamlOptions: _.omit(document, '__content'),
    markdown: document.__content || content
  };
};

export const getFilePaths = (workingDir, globPattern) => {
  return globSync(globPattern, {
    cwd: workingDir,
    ignore: '**/node_modules/**'
  });
};

export const isAbsoluteURL = path => path.indexOf('://') > 0 || path.indexOf('//') === 0;
