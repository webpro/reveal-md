#!/usr/bin/env node

var fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    program = require('commander'),
    server = require('./server'),
    pkg = require('../package.json');

var basePath = process.cwd(),
    baseName,
    filePath,
    revealPath = path.resolve(require.resolve('reveal.js'), '..', '..'),
    theme = 'black',
    highlightTheme = 'zenburn';

program
    .version(pkg.version)
    .usage('<slides.md> [options]')
    .option('-h, --host [host]', 'Host')
    .option('-p, --port [port]', 'Port')
    .option('-t, --theme [theme]', 'Theme')
    .option('-H, --highlightTheme [highlight theme]', 'Highlight theme')
    .option('-r, --print [filename]', 'Print')
    .option('-s, --separator [separator]', 'Slide separator')
    .option('-v, --verticalSeparator [vertical separator]', 'Vertical slide separator')
    .option('--disableAutoOpen', 'Disable to automatically open your web browser')
    .option('--static', 'Export static html to stdout. Save to reveal.js/index.html to' +
        ' match dependencies. HINT: printing does not work properly in this mode')
    .parse(process.argv);

if(program.args.length > 2) {
    program.help();
}

var pathArg = program.args[0];

// TODO: fix user can have own demo file/directory
if(pathArg === 'demo') {

    basePath = path.join(__dirname, '../demo');

} else if(pathArg) {

    filePath = path.resolve(pathArg);

    if(fs.existsSync(filePath)) {

        var stat = fs.statSync(filePath);

        if(stat.isFile()) {

            basePath = path.dirname(filePath);
            baseName = path.basename(filePath);

        } else if(stat.isDirectory()) {

            basePath = filePath;

        }

    } else {

        basePath = baseName = pathArg;

    }
}

theme = glob.sync('css/theme/*.css', {
    cwd: revealPath
}).concat(glob.sync('theme/*.css', {
    cwd: path.resolve(basePath)
})).filter(function(themePath) {
    return path.basename(themePath).replace(path.extname(themePath), '') === program.theme;
}).pop() || 'css/theme/' + theme + '.css';

highlightTheme = program.highlightTheme || highlightTheme;

// load custom reveal.js options from reveal.json
var revealOptions = {};
var manifestPath = path.join(basePath, 'reveal.json');
if(fs.existsSync(manifestPath) && fs.statSync(manifestPath).isFile(manifestPath)) {
    try {
        var options = require(manifestPath);
        if(typeof options === 'object') {
            revealOptions = options;
        }
    } catch(err) {
        console.log(err);
    }
}

// overide default theme from manifest options
if(!program.theme && revealOptions.theme) {
    theme = revealOptions.theme;
}

// overide default highlight theme from manifest options
if(!program.highlightTheme && revealOptions.highlightTheme) {
    highlightTheme = revealOptions.highlightTheme;
}

if (program.static) {
        server.toStaticHTML({
            basePath: basePath,
            initialMarkdownPath: baseName,
            theme: theme,
            highlightTheme: highlightTheme,
            separator: program.separator,
            verticalSeparator: program.verticalSeparator,
            printFile: program.print,
            revealOptions: revealOptions,
        });
} else {
        server.start({
            basePath: basePath,
            initialMarkdownPath: baseName,
            host: program.host,
            port: program.port,
            theme: theme,
            highlightTheme: highlightTheme,
            separator: program.separator,
            verticalSeparator: program.verticalSeparator,
            printFile: program.print,
            revealOptions: revealOptions,
            openWebBrowser: !program.disableAutoOpen
        });
}


// TODO: include make_static here!
