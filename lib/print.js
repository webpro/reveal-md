/* eslint-disable no-console */
import path from 'node:path';
import createDebug from 'debug';
import { getPuppeteerLaunchConfig, getPageOptions, revealBasePath } from './config.js';

const debug = createDebug('reveal-md');

let puppeteer;
try {
  puppeteer = await import('puppeteer');
} catch (err) {
  console.warn(`Puppeteer unavailable, unable to generate PDF file.`);
  debug(err);
}

// Exports ---------------------------------------------------------------------

export default async (initialUrl, print, printSize) => {
  if (!puppeteer) {
    return;
  }

  const puppeteerLaunchConfig = getPuppeteerLaunchConfig();

  const printPluginPath = path.join(revealBasePath, 'plugin', 'print-pdf', 'print-pdf.js');

  const filename = path.basename(initialUrl);
  const pdfFilename = typeof print === 'string' ? print : filename.replace(/\.md$/, '.pdf');

  debug({ initialUrl, printPluginPath, pdfFilename, puppeteerLaunchConfig });

  console.log(`Attempting to print "${filename}" to "${pdfFilename}".`);

  try {
    const browser = await puppeteer.launch(puppeteerLaunchConfig);
    const page = await browser.newPage();

    const pdfOptions = { path: pdfFilename, printBackground: true };
    Object.assign(pdfOptions, getPageOptions(printSize));

    await page.goto(`${initialUrl}?view=print`, { waitUntil: 'networkidle0' });
    await page.pdf(pdfOptions);
    await browser.close();
  } catch (err) {
    console.error(`Error while generating PDF for "${filename}"`);
    debug(err);
  }
};
