'use strict';

const bluebird = require('bluebird');
const fs = require('fs-extra');
const path = require('path');
var glob = require('glob');
bluebird.promisifyAll(glob);
const url = require('url');
const render = require('./render');
const featuredSlide = require('./featured-slide');
const imageDataURI = require('image-data-uri');
const Options = require('./options');
const _ = require('lodash');

const mdImageRE = /!\[([^\]]*)\]\(([^)]+)\)/gi;

function embedImages(markdown, options) {
  let image;
  const awaits = [];

  while ((image = mdImageRE.exec(markdown))) {
    const [imgMarkdown, imgTitle, imgPath] = image;
    const parsedUrl = url.parse(imgPath, true, true);
    const isUrl = !!(parsedUrl.host && parsedUrl.href);
    const encoder = isUrl ? imageDataURI.encodeFromURL : imageDataURI.encodeFromFile;
    const location = isUrl ? parsedUrl.href : path.join(options.initialDir, imgPath);
    const replaceFn = dataUri => {
      markdown = markdown.replace(imgMarkdown, `![${imgTitle}](${dataUri})`);
    };

    awaits.push(encoder(location).then(replaceFn));
  }

  return Promise.all(awaits)
    .then(() => markdown)
    .catch(err => {
      console.error(err);
      return markdown;
    });
}

module.exports = function renderStaticMarkup(options) {
  const { staticDir } = options;
  const assetsDir = path.join(staticDir, options.assetsDir);

  const awaits = ['css', 'js', 'plugin', 'lib'].map(dir =>
    fs.copyAsync(path.join(options.revealBasePath, dir), path.join(staticDir, dir))
  );

  awaits.push(featuredSlide(options));

  const staticDirs = typeof options.staticDirs === 'string' ? options.staticDirs.split(',') : options.staticDirs;
  const extraDirs = staticDirs.map(dir => fs.copyAsync(path.join(process.cwd(), dir), path.join(staticDir, dir)));

  awaits.push.apply(awaits, extraDirs);

  if (fs.lstatSync(options.initialPath).isDirectory()) {
    const list = glob.GlobAsync('**/*.md', {
      cwd: options.initialDir,
      ignore: ['node_modules/**', staticDir + '/**']
    });

    const listmarkAwait = list
      .then(list => {
        options.base = '.';
        return render.renderListFile(list, options);
      })
      .then(html => fs.outputFileAsync(path.join(staticDir, 'index.html'), html));

    awaits.push(listmarkAwait);

    list.then(list =>
      list.map(markdown => awaitPushMarkdownPage(path.join(options.initialPath, markdown), options, markdown))
    );
  } else {
    awaitPushMarkdownPage(options.initialPath, options);
  }

  function awaitPushMarkdownPage(file, options, subdir = null) {
    const parseSlideAwait = fs.readFileAsync(file).then(markdown => markdown.toString());
    const markupAwait = parseSlideAwait
      .then(markdown => {
        options.initialDir = Options.getInitalDir(file);
        return embedImages(markdown, options);
      })
      .then(markdown => {
        if (subdir != null) {
          options.base = subdir
            .split('/')
            .map(v => {
              return '..';
            })
            .join('/');
        } else {
          options.base = '.';
        }
        return render.render(markdown, options);
      })
      .then(markdown =>
        fs.outputFileAsync(path.join(staticDir + (subdir != null ? '/' + subdir : ''), 'index.html'), markdown)
      );
    awaits.push(markupAwait);
  }

  const highlightAwait = fs.copyAsync(options.highlightThemePath, path.join(staticDir, 'css', 'highlight'));

  awaits.push(highlightAwait);

  if (!_.isEmpty(options.scripts)) {
    fs.ensureDirSync(assetsDir);
    const assetAwaits = options.scriptSources.map(asset => fs.copyAsync(asset.path, path.join(assetsDir, asset.name)));
    awaits.push.apply(awaits, assetAwaits);
  }

  if (!_.isEmpty(options.css)) {
    fs.ensureDirSync(assetsDir);
    const assetAwaits = options.cssSources.map(asset => fs.copyAsync(asset.path, path.join(assetsDir, asset.name)));
    awaits.push.apply(awaits, assetAwaits);
  }

  Promise.all(awaits)
    .then(() => console.log(`Wrote static site to ${staticDir}`))
    .catch(console.error);
};
