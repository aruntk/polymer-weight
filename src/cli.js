#!/usr/bin/env node
import path from 'path';
import fs from 'fs';
import meow from 'meow';
import filesize from 'filesize';
import Table from 'cli-table';
import * as _ from 'lodash';
import { parseFile } from './links';

const cli = meow(`
    Usage
      $ weigh <input>

    Options
      --path, -P  Path to starting file/folder

    Examples
      $ weigh --path src/index.html
`);

const flags = cli.flags;

let sourcePath = flags.path ? path.resolve(flags.path): process.cwd();
const store = {};
const table = new Table({
  head: ['Type', 'Link', 'Size'],
  colWidths: [25, 100, 25],
  style: { head: ['red'], border: ['white'] },
  chars: { 'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' }
});

try {
  const stat = fs.statSync(sourcePath);
  const isDir = stat.isDirectory();
  const indexPath = isDir ? path.resolve(sourcePath, './index.html') : sourcePath;
  const store = {};
  parseFile(indexPath, store).then((r) => {
    const astColl = _.values(store);
    const sortedColl = _.sortBy(astColl, [function(ast) { return ast.fileStats.size; }]);
    _.each(sortedColl.reverse(), (ast) => {
      const size = filesize(ast.fileStats.size, { base: 10 });
      const absPath = ast.urlObject.absPath;
      const relPath = path.relative(path.dirname(indexPath), absPath);
      table.push([ast.tagName, relPath, size]);
    });
    console.log(table.toString());
  });
}
catch(e) {
  console.log(e);
}


