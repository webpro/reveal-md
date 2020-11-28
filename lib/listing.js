const Mustache = require('mustache');
const path = require('path');
const { getInitialDir, getOptions, getListingTemplate, getThemeUrl, getFilesGlob } = require('./config');
const { listFiles } = require('./util');

const renderListFile = async files => {
  const { title, listingTemplate, theme } = getOptions();
  const template = await getListingTemplate(listingTemplate);
  const themeUrl = getThemeUrl(theme, '.');
  return Mustache.render(template, {
    base: '',
    themeUrl,
    title,
    filePaths: files,
    fileNames: files.map(file => path.basename(file))
  });
};

module.exports = async (req, res) => {
  const list = listFiles(await getInitialDir(), getFilesGlob());
  const markup = await renderListFile(list);

  res.send(markup);
};

module.exports.renderListFile = renderListFile;
