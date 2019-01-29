const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const { promisify } = require('util');

const stat = promisify(fs.stat);

module.exports.isDirectory = _.memoize(async dir => {
  const stats = await stat(path.resolve(dir));
  return stats.isDirectory();
});
