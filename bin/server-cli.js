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
    themePath = __dirname + '/../node_modules/reveal.js/css/theme',
    theme = 'default',
    codeThemePath = __dirname + '/../template/css/',
    codeTheme = 'zenburn';

program
    .version(pkg.version)
    .usage('<slides.md> [options]')
    .option('-p, --port [port]', 'Port')
    .option('-t, --theme [theme]', 'Theme')
    .option('-c, --codeTheme [codeTheme]', 'Code theme')
    .option('-r, --print [filename]', 'Print')
    .option('-s, --separator [separator]', 'Slide separator')
    .option('-v, --verticalSeparator [vertical separator]', 'Vertical slide separator')
    .parse(process.argv);

if(program.args.length > 2) {
    program.help();
}

var pathArg = program.args[0];

if(pathArg === 'demo') {

    basePath = __dirname + '/../demo';

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

theme = glob.sync('*.css', {
    cwd: themePath
}).map(function(themePath) {
    return path.basename(themePath).replace(path.extname(themePath), '');
}).indexOf(program.theme) !== -1 ? program.theme : theme;

codeTheme = glob.sync('*.css', {
    cwd: codeThemePath
}).map(function(codeThemePath) {
    return path.basename(codeThemePath).replace(path.extname(codeThemePath), '');
}).indexOf(program.codeTheme) !== -1 ? program.codeTheme : codeTheme;

server.start(basePath, baseName, program.port, theme, codeTheme, program.separator, program.verticalSeparator, program.print);
