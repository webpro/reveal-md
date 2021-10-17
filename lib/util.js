const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const { promisify } = require('util');
const yamlFrontMatter = require('yaml-front-matter');
const glob = require('glob');

const stat = promisify(fs.stat);

module.exports.md = (() => {
  // Hack required since https://github.com/hakimel/reveal.js/commit/d780352b7f78e16635ce9fabf2dbb53639610f18
  global.Reveal = {
    registerPlugin: () => {}
  };
  return require('reveal.js/plugin/markdown/markdown')();
})();

module.exports.isDirectory = _.memoize(async dir => {
  const stats = await stat(path.resolve(dir));
  return stats.isDirectory();
});

module.exports.isFile = _.memoize(async dir => {
  const stats = await stat(path.resolve(dir));
  return stats.isFile();
});

module.exports.parseYamlFrontMatter = content => {
  const document = yamlFrontMatter.loadFront(content.replace(/^\uFEFF/, ''));
  return {
    yamlOptions: _.omit(document, '__content'),
    markdown: document.__content || content
  };
};

module.exports.getFilePaths = (workingDir, globPattern) => {
  return glob.sync(globPattern, {
    cwd: workingDir,
    ignore: '**/node_modules/**'
  });
};

module.exports.isAbsoluteURL = path => path.indexOf('://') > 0 || path.indexOf('//') === 0;
