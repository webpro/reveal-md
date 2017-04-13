const fs = require('fs-extra'),
  path = require('path'),
  render = require('./render').render,
  _ = require('lodash');

module.exports = function renderStaticMarkup(options) {

  /* eslint-disable no-console */

  const staticPath = options.static === true ? '_static' : options.static;
  const targetPath = path.resolve(process.cwd(), staticPath);

  const awaits = ['css', 'js', 'plugin', 'lib'].map(dir => fs.copyAsync(path.join(options.revealBasePath, dir), path.join(targetPath, dir)));

  const markupAwait = fs.readFileAsync(options.relativePath)
    .then(markdown => render(markdown.toString(), options))
    .then(markdown => fs.outputFileAsync(path.join(targetPath, 'index.html'), markdown));

  const highlightAwait = fs.copyAsync(options.highlightThemePath, path.join(targetPath, 'css', 'highlight'));

  awaits.push(markupAwait);
  awaits.push(highlightAwait);

  if(!_.isEmpty(options.scripts)) {
    const scriptsDir = path.join(targetPath, 'scripts');
    fs.ensureDirSync(scriptsDir);
    const scriptAwaits = options.scriptSources.map(scriptFile => fs.copyAsync(scriptFile.path, path.join(scriptsDir, scriptFile.name)));
    awaits.concat(scriptAwaits);
  }

  if(!_.isEmpty(options.css)) {
    const scriptsDir = path.join(targetPath, 'scripts');
    fs.ensureDirSync(scriptsDir);
    const scriptAwaits = options.cssSources.map(scriptFile => fs.copyAsync(scriptFile.path, path.join(scriptsDir, scriptFile.name)));
    awaits.concat(scriptAwaits);
  }

  Promise.all(awaits).then(() => console.log(`Wrote static site to ${targetPath}`)).catch(console.error);

};
