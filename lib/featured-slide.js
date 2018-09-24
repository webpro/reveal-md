//'use strict';
/** Uses Puppeteer to capture screenshot from featured slide
 *
 * If featuredSlide is not configured in FrontMatter first slide in the set will
 be used by default instead.
 */

const _ = require('lodash');
const path = require('path');
const debug = require('debug')('reveal-md');
const startServer = require('./serve');

let puppeteer;

try {
  puppeteer = require('puppeteer');
} catch (err) {}

module.exports = function snapshot(options) {
  const { initialPath, featuredSlide } = options;

  if (!featuredSlide) {
    return;
  }

  if (!puppeteer) {
    console.warn(`Puppeteer unavailable, unable to create featured slide image for OpenGraph metadata.`);
    return;
  }

  const opts = _.extend({}, options, {
    print: false,
    disableAutoOpen: true
  });

  const snapshotFilename = path.basename(initialPath).replace(/[^/]+\.md$/, `${options.staticDir}/featured-slide.jpg`);

  return new Promise((resolve, reject) => {
    startServer(opts, server => {
      const slideValue = parseInt(featuredSlide, 10);
      const slideAnchor = isNaN(slideValue) ? '' : `#/${slideValue - 1}`;
      const url = `http://${options.host}:${options.port}/${initialPath}${slideAnchor}`;

      return puppeteer
        .launch(options.puppeteerLaunchArgs ? { args: options.puppeteerLaunchArgs.split(' ') } : {})
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
        .then(() => resolve(snapshotFilename))
        .catch(err => {
          console.warn(`Error while generating featured slide snapshot for "${options.initialPath}"]`);
          debug(err);
          server.close();
          resolve();
        });
    });
  });
};
