const Mustache = require('mustache');
const { getInitialDir, getOptions, getListingTemplate, getThemeUrl, getFilesGlob } = require('./config');
const { listFiles } = require('./util');

const renderListFile = async files => {
  const { title, listingTemplate, theme } = getOptions();
  const template = await getListingTemplate(listingTemplate);
  const themeUrl = getThemeUrl(theme);
  const list = files.map(filePath => `<a href="${filePath}">${filePath}</a>`);
  return Mustache.to_html(template, {
    base: '',
    themeUrl,
    title,
    listing: list.join('<br>')
  });
};

module.exports = async (req, res) => {
  const list = listFiles(await getInitialDir(), getFilesGlob());
  const markup = await renderListFile(list);

  res.send(markup);
};

module.exports.renderListFile = renderListFile;
