import Mustache from 'mustache';
import path from 'node:path';
import { getInitialDir, getOptions, getListingTemplate, getThemeUrl, getFilesGlob } from './config.js';
import { getFilePaths, parseYamlFrontMatter } from './util.js';
import { readFile } from 'node:fs/promises';

const getFileMeta = async filePath => {
  const baseDir = await getInitialDir();
  const markdownFilePath = path.join(baseDir, filePath).replace(/\.html$/, '.md');
  let yamlOptions = {};
  try {
    const markdown = (await readFile(markdownFilePath)).toString();
    yamlOptions = parseYamlFrontMatter(markdown).yamlOptions;
  } catch (error) {
    console.error(error);
  }
  return Object.assign(
    {
      filePath,
      fileName: path.basename(filePath),
      absPath: path.resolve(filePath)
    },
    yamlOptions
  );
};

// Exports ---------------------------------------------------------------------

export const renderListFile = async filePaths => {
  const { title, listingTemplate, theme, assetsDir } = getOptions();
  const template = await getListingTemplate(listingTemplate);
  const themeUrl = getThemeUrl(theme, assetsDir, '.');
  let files = await Promise.all(filePaths.map(getFileMeta));
  files.sort((a, b) => a.fileName.localeCompare(b.fileName));
  return Mustache.render(template, {
    base: '',
    themeUrl,
    pageTitle: title,
    files,
    date: new Date().toISOString()
  });
};

export default async (req, res) => {
  const list = getFilePaths(await getInitialDir(), getFilesGlob());
  const markup = await renderListFile(list);

  res.send(markup);
};
