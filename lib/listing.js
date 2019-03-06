const glob = require('glob');
const Mustache = require('mustache');
const { getInitialDir, getOptions, getListingTemplate, getThemeUrl } = require('./config');

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
  const list = glob.sync('**/*.md', {
    cwd: await getInitialDir(),
    ignore: '**/node_modules/**'
  });

  const markup = await renderListFile(list);

  res.send(markup);
};

module.exports.renderListFile = renderListFile;
