const path = require('path');

module.exports.revealBasePath = path.resolve(require.resolve('reveal.js'), '..', '..');
module.exports.highlightThemePath = path.resolve(require.resolve('highlight.js'), '..', '..', 'styles');
