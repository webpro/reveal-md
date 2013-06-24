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

if(program.args[0] === 'demo') {

    basePath = __dirname + '/../demo';

} else if(program.args[0]) {

    filePath = path.resolve(program.args[0]);

    if(fs.statSync(filePath).isFile()) {

        basePath = path.dirname(filePath);
        baseName = path.basename(filePath);

        if(!fs.existsSync(filePath)) {
            console.log('File not found:', filePath);
            return;
        }

        if(['.md', '.markdown'].indexOf(path.extname(filePath)) === -1) {
            console.log('Incorrect file type (.md, .markdown):', filePath);
            return;
        }
    } else {

        basePath = filePath;
    }
}

theme = glob.sync('*.css', {
    cwd: themePath
}).map(function(themePath) {
    return path.basename(themePath).replace(path.extname(themePath), '')
}).indexOf(program.theme) !== -1 ? program.theme : theme;

server.start(basePath, baseName, program.port, theme, program.separator, program.vertical);
