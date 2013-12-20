var path = require('path'),
    fs = require('fs'),
    url = require('url'),
    http = require('http'),
    https = require('https'),
    express = require('express'),
    open = require('open'),
    Mustache = require('mustache'),
    glob = require('glob'),
    md = require('../node_modules/reveal.js/plugin/markdown/markdown');

var app = express.createServer();
var staticDir = express.static;

var serverBasePath = path.resolve(__dirname + '/../');

var opts = {
    port: 1948,
    userBasePath: process.cwd(),
    revealBasePath: serverBasePath + '/node_modules/reveal.js/',
    template: fs.readFileSync(serverBasePath + '/template/reveal.html').toString(),
    templateListing: fs.readFileSync(serverBasePath + '/template/listing.html').toString(),
    theme: 'default',
    separator: '^\n---\n$',
    vertical: '^\n----\n$'
};

app.configure(function() {
    [ 'css', 'js', 'images', 'plugin', 'lib' ].forEach(function(dir) {
        app.use('/' + dir, staticDir(opts.revealBasePath + dir));
    });
});

var startMarkdownServer = function(basePath, initialMarkdownPath, port, theme, separator, vertical) {

    opts.userBasePath = basePath;
    opts.port = port || opts.port;
    opts.theme = theme || opts.theme;
    opts.separator = separator || opts.separator;
    opts.vertical = vertical || opts.vertical;

    generateMarkdownListing();

    app.get(/(\w+\.md)$/, renderMarkdownAsSlides);
    app.get('/', renderMarkdownFileListing);
    app.get('/*', staticDir(opts.userBasePath));

    app.listen(opts.port || null);

    console.log('Reveal-server started, opening at http://localhost:' + opts.port);
    open('http://localhost:' + opts.port + (initialMarkdownPath ? '/' + initialMarkdownPath : ''));
};

var renderMarkdownAsSlides = function(req, res) {

    var markdown = '',
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

    slides = md.slidify(markdown, opts.separator, opts.vertical);

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
