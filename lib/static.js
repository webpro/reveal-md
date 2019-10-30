/* eslint-disable no-console */
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const _ = require('lodash');
const url = require('url');
const { getOptions, getAssetsDir, getPath, getStaticDir, getSlideOptions } = require('./config');
const { isDirectory, parseYamlFrontMatter } = require('./util');
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

const copyAssetsFromOptions = function(markdown) {
  const { yamlOptions } = parseYamlFrontMatter(markdown.toString());
  const options = getSlideOptions(yamlOptions);
  const staticDir = getStaticDir();
  const awaits = [
    cp(
      path.join(highlightThemePath, options.highlightTheme + '.css'),
      path.join(staticDir, 'css', 'highlight', options.highlightTheme + '.css')
    )
  ];
  return awaits.concat(
    _.flow(
      _.flatten,
      _.compact,
      _.partialRight(_.map, asset => cp(asset, path.join(staticDir, getAssetsDir(), asset)))
    )([
      typeof options.scripts === 'string' ? options.scripts.split(',') : options.scripts,
      typeof options.css === 'string' ? options.css.split(',') : options.css
    ])
  );
};

const copyAssetsAndWriteFile = async (sourceDir, file, targetDir) => {
  const markdown = await fs.readFile(path.join(sourceDir, file));
  const awaits = copyAssetsFromOptions(markdown);
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
  return Promise.all(awaits);
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
        ...list.map(file => copyAssetsAndWriteFile(sourceDir, file, targetDir))
      ])
    );
  } else {
    const fileName = path.basename(sourceDir);
    const markupName = fileName.replace(/\.md$/, '.html');
    await copyAssetsAndWriteFile(path.dirname(sourceDir), fileName, targetDir);
    return link(path.join(targetDir, markupName), path.join(targetDir, 'index.html'));
  }
};

module.exports = async () => {
  const options = getOptions();
  const staticDir = getStaticDir();

  await Promise.all(
    ['css', 'js', 'plugin', 'lib'].map(dir => cp(path.join(revealBasePath, dir), path.join(staticDir, dir)))
  );

  const staticDirs = typeof options.staticDirs === 'string' ? options.staticDirs.split(',') : options.staticDirs;
  await Promise.all(
    staticDirs.map(dir => cp(path.join(process.cwd(), dir), path.join(staticDir, relativeDir(getPath(), dir))))
  );

  await writeMarkupFiles(getPath(), staticDir);

  console.log(`Wrote static site to ${staticDir}`);
};
