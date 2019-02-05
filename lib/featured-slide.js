/* eslint-disable no-console */
const _ = require('lodash');
const debug = require('debug')('reveal-md');
const { getHost, getPort, getOptions, getPuppeteerLaunchConfig } = require('./config');

const host = getHost();
const port = getPort();

let puppeteer;

try {
  puppeteer = require('puppeteer');
} catch (err) {
  console.warn(`Puppeteer unavailable, unable to create featured slide image for OpenGraph metadata.`);
  debug(err);
}

const getSlideAnchor = featuredSlide => {
  const [slide, subslide] = featuredSlide.split('-').map(slide => _.parseInt(slide, 10));
  return `${isNaN(slide) ? '' : '#/' + slide + (isNaN(subslide) ? '' : '/' + subslide)}`;
};

module.exports = async (initialUrl, targetDir) => {
  const { featuredSlide } = getOptions();

  if (!featuredSlide || !puppeteer) {
    return;
  }

  const puppeteerLaunchConfig = getPuppeteerLaunchConfig();

  const snapshotFilename = `${targetDir}/featured-slide.jpg`;

  const url = `http://${host}:${port}/${initialUrl}${getSlideAnchor(featuredSlide.toString())}`;

  debug({ url, snapshotFilename, puppeteerLaunchConfig });

  try {
    const browser = await puppeteer.launch(puppeteerLaunchConfig);
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1200 });
    await page.goto(url, { waitUntil: 'load' });
    await page.screenshot({ path: snapshotFilename, quality: 70, fullPage: true });
    await browser.close();
  } catch (err) {
    console.warn(`Error while generating featured slide snapshot for "${initialUrl}"]`);
    debug(err);
  }
};
