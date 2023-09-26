const Mustache = require('mustache');
const path = require('path');
const { getInitialDir, getOptions, getListingTemplate, getThemeUrl, getFilesGlob } = require('./config');
const { getFilePaths, parseYamlFrontMatter } = require('./util');
const fs = require('fs-extra');

const getFileMeta = async filePath => {
  const baseDir = await getInitialDir();
  const markdownFilePath = path.join(baseDir, filePath).replace(/\.html$/, '.md');
  let yamlOptions = {};
  try {
    const markdown = (await fs.readFile(markdownFilePath)).toString();
    yamlOptions = parseYamlFrontMatter(markdown).yamlOptions;
  } catch (error) {
    console.error(error);
  }
  return Object.assign(
    {
      filePath,
      fileName: path.basename(filePath),
      absPath: path.resolve(filePath)
    },
    yamlOptions
  );
};

const renderListFile = async filePaths => {
  const { title, listingTemplate, theme, assetsDir } = getOptions();
  const template = await getListingTemplate(listingTemplate);
  const themeUrl = getThemeUrl(theme, assetsDir, '.');
  const files = await Promise.all(filePaths.map(getFileMeta));
  return Mustache.render(template, {
    base: '',
    themeUrl,
    pageTitle: title,
    files,
    date: new Date().toISOString()
  });
};

module.exports = async (req, res) => {
  const list = getFilePaths(await getInitialDir(), getFilesGlob());
  const markup = await renderListFile(list);

  res.send(markup);
};

module.exports.renderListFile = renderListFile;
