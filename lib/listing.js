const Mustache = require('mustache');
const path = require('path');
const { getInitialDir, getOptions, getListingTemplate, getThemeUrl, getFilesGlob } = require('./config');
const { listFiles, parseYamlFrontMatter } = require('./util');
const fs = require('fs-extra');


const listFilesMeta = async (files) => {
  const baseDir = await getInitialDir();

  return Promise.all(files.map(async filePath => {
    const markdownFilePath = path.join(baseDir, filePath).replace('.html', '.md');
    const markdown = await fs.readFile(markdownFilePath);
    let yamlOptions = {};
    try {
      yamlOptions = parseYamlFrontMatter(markdown.toString()).yamlOptions;
    } catch(e) {
      // there might be no front matter info in the file
    }
    return {
      filePath,
      yamlOptions
    }
  }));
}

const renderListFile = async files => {
  const { title, listingTemplate, theme } = getOptions();
  const template = await getListingTemplate(listingTemplate);
  const themeUrl = getThemeUrl(theme, '.');
  const extendedFileRecords = await listFilesMeta(files);
  return Mustache.render(template, {
    base: '',
    themeUrl,
    title,
    filePaths: files,
    fileNames: files.map(file => path.basename(file)),
    extendedFileRecords,
  });
};

module.exports = async (req, res) => {
  const list = listFiles(await getInitialDir(), getFilesGlob());
  const markup = await renderListFile(list);

  res.send(markup);
};

module.exports.renderListFile = renderListFile;
