/* eslint-disable no-console */
import fs from 'fs-extra';
import path from 'node:path';
import _ from 'lodash';
import {
  getOptions,
  getAssetsDir,
  getPath,
  getStaticDir,
  getSlideOptions,
  getFilesGlob,
  getFaviconPath,
  revealBasePath,
  highlightThemePath
} from './config.js';
import { isDirectory, parseYamlFrontMatter, getFilePaths, isAbsoluteURL } from './util.js';
import { renderFile } from './render.js';
import { renderListFile } from './listing.js';
import featuredSlide from './featured-slide.js';

const files = new Set();

const htmlImageRE = /!\[.*?\]\((.+?)\)/g;
const htmlImageBackgroundRE = /<!--.*?data-background-image=["'](.+?)["'].*?-->/g;

const relativeDir = (from, to) => path.relative(from, to).replace(/^\.\./, '.');

const readablePath = file =>
  file.replace(/^.*(reveal-md\/node_modules.+)/, '$1').replace(new RegExp(`^${process.cwd()}/`), '');

const cp = (source, target) => {
  if (!files.has(target)) {
    files.add(target);
    console.log(`❏ ${readablePath(source)} → ${target}`);
    return fs.copy(source, target);
  } else {
    return Promise.resolve();
  }
};

const write = (target, content) => {
  console.log(`★ ${target}`);
  return fs.outputFile(target, content);
};

const copyAssetsFromOptions = async function (markdown) {
  const { yamlOptions } = parseYamlFrontMatter(markdown);
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
      assets => assets.filter(asset => (asset && !asset.startsWith('http') ? asset : null)),
      _.compact,
      _.partialRight(_.map, asset => cp(asset, path.join(staticDir, getAssetsDir(), asset)))
    )([
      typeof options.scripts === 'string' ? options.scripts.split(',') : options.scripts,
      typeof options.css === 'string' ? options.css.split(',') : options.css,
      (await fs.pathExists(options.theme)) ? options.theme : null
    ])
  );
};

const copyAssetsAndWriteFile = async (sourceDir, file, targetDir) => {
  const sourcePath = path.join(sourceDir, file);
  const targetPath = path.join(targetDir, file).replace(/\.md$/, '.html');
  const markdown = (await fs.readFile(sourcePath)).toString();
  const awaits = await copyAssetsFromOptions(markdown);
  const base = relativeDir(file, '.');
  const markup = await renderFile(path.join(sourceDir, file), { base });

  const images = markdown.matchAll(htmlImageRE);
  const backgroundImages = markdown.matchAll(htmlImageBackgroundRE);
  const allImages = [...images, ...backgroundImages];

  for (let image of allImages) {
    const [, imgPath] = image;
    if (!isAbsoluteURL(imgPath)) {
      const relPath = path.join(path.dirname(file), imgPath);
      awaits.push(cp(path.join(sourceDir, relPath), path.join(targetDir, relPath)).catch(err => console.warn(err)));
    }
  }

  awaits.push(write(targetPath, markup));
  awaits.push(featuredSlide(file, path.join(targetDir, path.dirname(file))));
  return Promise.all(awaits);
};

const writeMarkupFiles = async (sourceDir, targetDir) => {
  if (await isDirectory(sourceDir)) {
    const list = getFilePaths(sourceDir, getFilesGlob());
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
    if (markupName !== 'index.html') {
      return cp(path.join(targetDir, markupName), path.join(targetDir, 'index.html'));
    }

    return Promise.resolve();
  }
};

// Exports ---------------------------------------------------------------------

export default async () => {
  const options = getOptions();
  const staticDir = getStaticDir();

  await Promise.all(['dist', 'plugin'].map(dir => cp(path.join(revealBasePath, dir), path.join(staticDir, dir))));

  const staticDirs = typeof options.staticDirs === 'string' ? options.staticDirs.split(',') : options.staticDirs;
  await Promise.all(
    staticDirs.map(dir => cp(path.join(process.cwd(), dir), path.join(staticDir, relativeDir(getPath(), dir))))
  );

  await writeMarkupFiles(getPath(), staticDir);

  const faviconPath = await getFaviconPath();
  await cp(faviconPath, path.join(staticDir, 'favicon.ico'));

  console.log(`Wrote static site to ${staticDir}`);
};
