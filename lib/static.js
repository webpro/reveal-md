/* eslint-disable no-console */
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const _ = require('lodash');
const url = require('url');
const { getOptions, getAssetsDir, getPath, getStaticDir } = require('./config');
const { isDirectory } = require('./util');
const { revealBasePath, highlightThemePath } = require('./constants');
const { renderFile } = require('./render');
const { renderListFile } = require('./listing');
const featuredSlide = require('./featured-slide');

const mdImageRE = /!\[([^\]]*)\]\(([^)]+)\)/gi;

const relativeDir = (from, to) => path.relative(from, to).replace(/^\.\./, '.');

const readablePath = file =>
  file.replace(/^.*(reveal-md\/node_modules.+)/, '$1').replace(new RegExp(`^${process.cwd()}/`), '');

const cp = (source, target) => {
  console.log(`❏ ${readablePath(source)} → ${target}`);
  return fs.copy(source, target);
};

const write = (target, content) => {
  console.log(`★ ${target}`);
  return fs.outputFile(target, content);
};

const link = (source, target) => {
  console.log(`∞ ${source} → ${target}`);
  return fs.ensureSymlink(source, target);
};

const copyImagesAndWriteFile = async (sourceDir, file, targetDir) => {
  const markdown = await fs.readFile(path.join(sourceDir, file));
  const awaits = [];
  let image;
  while ((image = mdImageRE.exec(markdown))) {
    const [, , imgPath] = image;
    const parsedUrl = url.parse(imgPath, true, true);
    if (!(parsedUrl.host && parsedUrl.href)) {
      const relPath = path.join(path.dirname(file), imgPath);
      awaits.push(cp(path.join(sourceDir, relPath), path.join(targetDir, relPath)));
    }
  }
  const base = relativeDir(file, '.');
  const markup = await renderFile(path.join(sourceDir, file), { base });
  awaits.push(write(path.join(targetDir, file).replace(/\.md$/, '.html'), markup));
  awaits.push(featuredSlide(file, path.join(targetDir, path.dirname(file))));
  return awaits;
};

const writeMarkupFiles = async (sourceDir, targetDir) => {
  if (await isDirectory(sourceDir)) {
    const list = glob.sync('**/*.md', {
      cwd: sourceDir,
      ignore: 'node_modules/**'
    });
    const listMarkup = await renderListFile(list.map(file => file.replace(/\.md$/, '.html')));
    return Promise.all(
      _.flatten([
        write(path.join(targetDir, 'index.html'), listMarkup),
        ...list.map(async file => copyImagesAndWriteFile(sourceDir, file, targetDir))
      ])
    );
  } else {
    const fileName = path.basename(sourceDir);
    const markupName = fileName.replace(/\.md$/, '.html');
    await copyImagesAndWriteFile(path.dirname(sourceDir), fileName, targetDir);
    return link(path.join(targetDir, markupName), path.join(targetDir, 'index.html'));
  }
};

module.exports = async () => {
  const options = getOptions();
  const { highlightTheme } = options;
  const staticDir = getStaticDir();
  const assetsDir = getAssetsDir();

  await Promise.all(
    ['css', 'js', 'plugin', 'lib'].map(dir => cp(path.join(revealBasePath, dir), path.join(staticDir, dir)))
  );

  await cp(
    path.join(highlightThemePath, highlightTheme + '.css'),
    path.join(staticDir, 'css', 'highlight', highlightTheme + '.css')
  );

  const staticDirs = typeof options.staticDirs === 'string' ? options.staticDirs.split(',') : options.staticDirs;
  await Promise.all(
    staticDirs.map(dir => cp(path.join(process.cwd(), dir), path.join(staticDir, relativeDir(getPath(), dir))))
  );

  await writeMarkupFiles(getPath(), staticDir);

  const assets = _.compact(
    _.flatten([
      typeof options.scripts === 'string' ? options.scripts.split(',') : options.scripts,
      typeof options.css === 'string' ? options.css.split(',') : options.css
    ])
  );
  await Promise.all(assets.map(async asset => cp(asset, path.join(staticDir, assetsDir, asset))));

  console.log(`Wrote static site to ${staticDir}`);
};
