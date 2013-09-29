#!/usr/bin/env node

var fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    program = require('commander'),
    server = require('./server');

var basePath = process.cwd(),
    baseName,
    filePath,
    themePath = __dirname + '/../node_modules/reveal.js/css/theme',
    theme = 'default';

program
    .version('0.0.1')
    .usage('<slides.md> [options]')
    .option('-p, --port [port]', 'Port')
    .option('-t, --theme [theme]', 'Theme')
    .option('-s, --separator [separator]', 'Slide separator')
    .option('-v, --vertical [vertical separator]', 'Vertical slide separator')
    .parse(process.argv)

if(program.args.length > 2) {
    program.help()
}

var pathArg = program.args[0];

if(pathArg === 'demo') {

    basePath = __dirname + '/../demo';

} else if(pathArg) {

    filePath = path.resolve(pathArg)

    if(fs.statSync(filePath).isFile()) {

        basePath = path.dirname(filePath);
        baseName = path.basename(filePath);

    } else if(fs.statSync(filePath).isDirectory()) {

        basePath = filePath;

    } else {

        basePath = baseName = pathArg;

    }
}

theme = glob.sync('*.css', {
    cwd: themePath
}).map(function(themePath) {
    return path.basename(themePath).replace(path.extname(themePath), '')
}).indexOf(program.theme) !== -1 ? program.theme : theme;

server.start(basePath, baseName, program.port, theme, program.separator, program.vertical);
