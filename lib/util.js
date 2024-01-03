import * as fs from 'node:fs';
import path from 'node:path';
import _ from 'lodash';
import yamlFrontMatter from 'yaml-front-matter';
import { globSync } from 'glob';
import { promisify } from 'node:util';
import json5 from 'json5';

const stat = promisify(fs.stat);

// Exports ---------------------------------------------------------------------

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
    ignore: '**/node_modules/**',
    posix: true
  });
};

export const isAbsoluteURL = path => path.indexOf('://') > 0 || path.indexOf('//') === 0;

export const loadJSON = filePath => {
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
};

export const tryReadJson5Configs = (...possibleConfigFiles) => {
  for (const configFile of possibleConfigFiles) {
    try {
      return json5.parse(fs.readFileSync(configFile, 'utf8'));
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
  }

  return undefined;
};
