const test = require('bron');
const assert = require('assert').strict;
const pkg = require('../package.json');
const path = require('path');
const fs = require('fs-extra');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const inspect_brk = process.env.VSCODE_DEBUGGING === 'true' ? '--inspect-brk' : '';
const reveal_md = `node ${inspect_brk} ${path.join(__dirname, '../bin', 'reveal-md.js')}`;

test('should print version', async () => {
  const { stdout } = await exec(`${reveal_md} --version`);
  assert.equal(stdout.trim(), pkg.version);
});

test('should provide help', async () => {
  const help = await fs.readFile(path.join(process.cwd(), 'bin/help.txt'));
  const { stdout } = await exec(`${reveal_md} --help`);
  assert.equal(stdout.trim(), help.toString().trim());
});

test('should exit on error', async () => {
  await assert.rejects(
    () => exec(`${reveal_md} no_such_file.md`),
    /\[Error: ENOENT: no such file or directory, stat '.*no_such_file.md'\]/
  );
});
