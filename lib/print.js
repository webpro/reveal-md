/* eslint-disable no-console */
const path = require('path');
const debug = require('debug')('reveal-md');
const { revealBasePath } = require('./constants');
const { getRevealOptions, getPuppeteerLaunchConfig } = require('./config');
let puppeteer;

try {
  puppeteer = require('puppeteer');
} catch (err) {
  console.warn(`Puppeteer unavailable, unable to generate PDF file.`);
  debug(err);
}

const getPageOptions = revealOptions => {
  if (revealOptions.width && revealOptions.height) {
    return { width: revealOptions.width, height: revealOptions.height };
  } else {
    return { format: 'A4' };
  }
};

module.exports = async (initialUrl, print) => {
  if (!puppeteer) {
    return;
  }

  const puppeteerLaunchConfig = getPuppeteerLaunchConfig();
  const revealOptions = getRevealOptions();

  const printPluginPath = path.join(revealBasePath, 'plugin', 'print-pdf', 'print-pdf.js');

  const filename = path.basename(initialUrl);
  const pdfFilename = typeof print === 'string' ? print : filename.replace(/\.md$/, '.pdf');

  debug({ initialUrl, printPluginPath, pdfFilename, puppeteerLaunchConfig });

  console.log(`Attempting to print "${filename}" to "${pdfFilename}".`);

  try {
    const browser = await puppeteer.launch(puppeteerLaunchConfig);
    const page = await browser.newPage();

    const pdfOptions = { path: pdfFilename, printBackground: true };
    Object.assign(pdfOptions, getPageOptions(revealOptions));

    await page.goto(`${initialUrl}?print-pdf`, { waitUntil: 'load' });
    await page.pdf(pdfOptions);
    await browser.close();
  } catch (err) {
    console.error(`Error while generating PDF for "${filename}"`);
    debug(err);
  }
};
