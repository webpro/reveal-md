var path = require('path'),
    fs = require('fs'),
    url = require('url'),
    http = require('http'),
    https = require('https'),
    express = require('express'),
    open = require('open'),
    Mustache = require('mustache'),
    glob = require('glob'),
    md = require('../node_modules/reveal.js/plugin/markdown/markdown'),
    exec = require('child_process').exec;

var app = express.createServer();
var staticDir = express.static;

var serverBasePath = path.resolve(__dirname + '/../');

var opts = {
    printMode: false,
    port: 1948,
    userBasePath: process.cwd(),
    revealBasePath: serverBasePath + '/node_modules/reveal.js/',
    template: fs.readFileSync(serverBasePath + '/template/reveal.html').toString(),
    templateListing: fs.readFileSync(serverBasePath + '/template/listing.html').toString(),
    theme: 'default',
    separator: '^\n---\n$',
    verticalSeparator: '^\n----\n$'
};

var printPluginPath = serverBasePath + '/node_modules/reveal.js/plugin/print-pdf/print-pdf.js';

app.configure(function() {
    [ 'css', 'js', 'images', 'plugin', 'lib' ].forEach(function(dir) {
        app.use('/' + dir, staticDir(opts.revealBasePath + dir));
    });
});

var startMarkdownServer = function(basePath, initialMarkdownPath, port, theme, separator, verticalSeparator, printFile) {
    var sourceFile;

    opts.userBasePath = basePath;
    opts.port = port || opts.port;
    opts.theme = theme || opts.theme;
    opts.separator = separator || opts.separator;
    opts.verticalSeparator = verticalSeparator || opts.verticalSeparator;
    opts.printMode = typeof printFile !== 'undefined' && printFile || opts.printMode,
    generateMarkdownListing();

    app.get(/(\w+\.md)$/, renderMarkdownAsSlides);
    app.get('/', renderMarkdownFileListing);
    app.get('/*', staticDir(opts.userBasePath));

    app.listen(opts.port || null);

    var initialFilePath = 'http://localhost:' + opts.port + (initialMarkdownPath ? '/' + initialMarkdownPath : '');

    if (!!opts.printMode) {
      sourceFile = initialMarkdownPath;

      // If print parameter was left empty, printFile should equal `true`
      // Give it a better filename, default to the initialMarkdownPath
      if (printFile === true) {
        printFile = sourceFile.replace(/\.md$/,'');
      }

      console.log('Attempting to print "' + sourceFile + '" to filename "' + printFile + '" as PDF');
      exec('phantomjs ' + printPluginPath + ' ' + initialFilePath + '?print-pdf' + ' ' + printFile, function( err, stdout, stderr ) {
          if (err) {
            console.log(("[Error with path '" + printFile + "']\n" + stderr + "\n" + err.toString()).red);
          } else {
            console.log(stdout);
          }
          // close the server after we're done, print mode we won't keep the server open
          // this could be configurable if we wanted to, but my thought was that
          // when you're deciding to print, you just want the output pdf file
          app.close();
      });
    } else {
      console.log('Reveal-server started, opening at http://localhost:' + opts.port);
      open(initialFilePath);
    }
};

var renderMarkdownAsSlides = function(req, res) {

    var markdown = '',
        markdownPath;

    // Look for print-pdf option
    if (~req.url.indexOf('?print-pdf')) {
      req.url = req.url.replace('?print-pdf','');
    }

    markdownPath = path.resolve(opts.userBasePath + req.url);

    if(fs.existsSync(markdownPath)) {
        markdown = fs.readFileSync(markdownPath).toString();
        render(res, markdown)
    } else {
        var parsedUrl = url.parse(req.url.replace(/^\//, ''));
        if(parsedUrl) {
            (parsedUrl.protocol === 'https:' ? https : http).get(parsedUrl.href, function(response) {
                response.on('data', function(chunk) {
                    markdown += chunk;
                });
                response.on('end', function() {
                    render(res, markdown)
                });
            }).on('error', function(e) {
                console.log('Problem with path/url: ' + e.message);
                render(res, e.message)
            });
        }
    }
};

var render = function(res, markdown) {

    slides = md.slidify(markdown, opts);

    res.send(Mustache.to_html(opts.template, {
        theme: opts.theme,
        slides: slides
    }));
};

var generateMarkdownListing = function(userBasePath) {
    var list = [];

    glob.sync("**/*.md", {
        cwd: userBasePath || opts.userBasePath
    }).forEach(function(file) {
        list.push('<a href="' + file + '">' + file + '</a>')
    });

    return Mustache.to_html(opts.templateListing, {
        theme: opts.theme,
        listing: list.join('<br>')
    });
};

var renderMarkdownFileListing = function(req, res) {
    res.send(generateMarkdownListing())
};

module.exports = {
    start: startMarkdownServer
};
