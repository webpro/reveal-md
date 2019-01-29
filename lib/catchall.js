const url = require('url');
const got = require('got');
const renderMarkdownFileListing = require('./listing');

module.exports = (req, res, next) => {
  const parsedUrl = url.parse(req.params[0], true, true);
  if (parsedUrl.host) {
    got.stream(req.params[0]).pipe(res);
  } else {
    renderMarkdownFileListing(req, res, next);
  }
};
