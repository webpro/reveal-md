import test from 'node:test';
import { strict as assert } from 'assert';
import path from 'node:path';
import url from 'node:url';
import { readFile } from 'node:fs/promises';
import { exec as _exec } from 'node:child_process';
import { promisify } from 'node:util';
import { loadJSON } from '../lib/util.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const pkg = loadJSON(path.join(__dirname, '../package.json'));

const exec = promisify(_exec);

const inspect_brk = process.env.VSCODE_DEBUGGING === 'true' ? '--inspect-brk' : '';
const reveal_md = `node ${inspect_brk} ${path.join(__dirname, '../bin', 'reveal-md.js')}`;

test('should print version', async () => {
  const { stdout } = await exec(`${reveal_md} --version`);
  assert.equal(stdout.trim(), pkg.version);
});

test('should provide help', async () => {
  const { stdout } = await exec(`${reveal_md} --help`);
  const help = await readFile(path.join(process.cwd(), 'bin/help.txt'));
  assert.equal(stdout.trim(), help.toString().trim());
});

test('should exit on error', async () => {
  await assert.rejects(
    () => exec(`${reveal_md} no_such_file.md`),
    /\[Error: ENOENT: no such file or directory, stat '.*no_such_file.md'\]/
  );
});
