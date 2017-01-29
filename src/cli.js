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
    const group = _.groupBy(astColl, ast => ast.urlObject.local ? 'local': 'external');
    if(!group.local && !group.external) {
      console.log('No Links Found');
      return;
    }
    const sortedColl = _.sortBy(group.local, [function(ast) {
      return ast.fileStats.size;
    }]);
    let netIndexSize = stat.size;
    _.each(sortedColl.reverse(), (ast) => {
      netIndexSize += ast.fileStats.size;
      const size = filesize(ast.fileStats.size, { base: 10 });
      const absPath = ast.urlObject.absPath;
      const relPath = path.relative(path.dirname(indexPath), absPath);
      table.push([ast.tagName, relPath, size]);
    });
    _.each(group.external, (ast) => {
      const absPath = ast.urlObject.absPath;
      table.push([ast.tagName, absPath, 'NA']);
    });
    table.push(['Total', path.basename(indexPath), filesize(netIndexSize, { base: 10 })]);
    console.log(table.toString());
  });
}
catch(e) {
  console.log(e);
}


