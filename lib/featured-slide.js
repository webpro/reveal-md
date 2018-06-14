//'use strict';
/** Uses Puppeteer to capture screenshot from featured slide
 *
 * If featuredSlide is not configured in FrontMatter first slide in the set will
 be used by default instead.
 */

const _ = require('lodash');
const path = require('path');
const debug = require('debug');
const startServer = require('./serve');

let puppeteer;

try {
  puppeteer = require('puppeteer');
} catch (err) {}

module.exports = function snapshot(options) {
  const { initialPath } = options;

  if (!puppeteer) {
    console.warn(`Puppeteer unavailable, unable to create featured slide image for OpenGraph metadata.`);
    return;
  }

  const opts = _.extend({}, options, {
    print: false,
    disableAutoOpen: true
  });

  const snapshotFilename = path.basename(initialPath).replace(/[^/]+\.md$/, `${options.static}/featured-slide.jpg`);

  startServer(opts, server => {
    const { initialPath, featuredSlide } = options;
    const slideAnchor = featuredSlide ? `#/${featuredSlide}` : '';
    const url = `http://${options.host}:${options.port}/${initialPath}${slideAnchor}`;

    return puppeteer
      .launch()
      .then(browser =>
        browser
          .newPage()
          .then(page => {
            return page.setViewport({ width: 1200, height: 1200 }).then(() => page);
          })
          .then(page => {
            return page.goto(`${url}`, { waitUntil: 'load' }).then(() => {
              return page
                .screenshot({
                  path: snapshotFilename,
                  quality: 70,
                  fullPage: true
                })
                .then(() => browser.close())
                .then(() => server.close());
            });
          })
      )
      .catch(err => {
        debug(err);
        console.error(
          `[Error while generating featured slide snapshot for "${options.relativePath}"]\n${err.toString()}`
        );
      });
  });
};
