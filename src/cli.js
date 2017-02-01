#!/usr/bin/env node
import path from 'path';
import fs from 'fs';
import meow from 'meow';
import filesize from 'filesize';
import Table from 'cli-table2';
import * as _ from 'lodash';
import windowSize from 'window-size';
import { parseFile } from './links';

const cli = meow(`
    Usage
      $ weigh <input>

    Options
      --path, -P  Path to starting file/folder
      --depth, -d  How deep should the table show

    Examples
      $ weigh --path src/index.html
`);

const flags = cli.flags;

let sourcePath = flags.path ? path.resolve(flags.path): process.cwd();
const tDepth = flags.depth;
const store = {};
function getWidth(p) {
  return Math.round(p * (windowSize.width - 14) / 100);
}
const colWidths = [4, 5, 34, 8, 8, 6, 35].map(getWidth);
const table = new Table({
  head: ['#', 'Type', 'Link', 'Net Weight', 'Standalone Weight', 'File Size', 'Occurances'],
  colWidths,
  style: { head: ['red'], border: ['green'] },
  chars: { 'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' }
});

try {
  const stat = fs.statSync(sourcePath);
  const isDir = stat.isDirectory();
  const indexPath = isDir ? path.resolve(sourcePath, './index.html') : sourcePath;
  parseFile(indexPath, store).then((r) => {
    const localLinks = _.filter(_.values(store), ast => ast.urlObject.local);
    const indexWeight = calcOtherWeights(localLinks, indexPath, stat.size);
    const fSize = filesize(stat.size, { base: 10 });
    const nSize = filesize(indexWeight.sharedSize + indexWeight.sSize, { base: 10 });
    const sSize = filesize(indexWeight.sSize, { base: 10 });
    const astColl = _.values(store);
    let visibleColl;

    if(tDepth) {
      let visibleLinks = [indexPath];
      for(let i = 0; i < tDepth; i += 1) {
        visibleLinks = visibleLinks.concat(walkLinks(astColl, visibleLinks));
      }
      visibleColl = _.values(_.pick.apply(null, [store].concat(visibleLinks)));
    }

    const group = _.groupBy(visibleColl || astColl, ast => ast.urlObject.local ? 'local': 'external');

    const tableArray = toTableArray(group, stat.size, indexPath);

    const sortedTable = _.sortBy(tableArray, [function(a) {
      return a.detail.size;
    }]);

    sortedTable.push({
      arr : ['Total', path.basename(indexPath), nSize, sSize, fSize, ''],
      detail: { size: nSize },
    });

    _.each(sortedTable.reverse(), function(a, i) {
      let arr = _.map(a.arr, breakLine);
      arr.splice(0, 0, i || '');
      table.push(arr);
    });

    console.log(table.toString());
  });
}
catch(e) {
  console.log(e);
}

function walkLinks(links, filePaths) {

  const immChildren = _.filter(links, (link) => {
    return _.find(link.occurances, (o) => {
      return filePaths.indexOf(o.filePath) !== -1;
    });
  });

  return _.map(immChildren, (link) => {
    return link.urlObject.absPath;
  });

}

function calcOtherWeights(links, filePath, fSize) {
  let sharedSize = 0;
  let sSize = 0;
  const immChildren = _.filter(links, (link) => {
    return _.find(link.occurances, (o) => {
      return o.filePath === filePath;
    });
  });
  if(immChildren) {
    _.each(immChildren, (c) => {
      calcOtherWeights(links, c.urlObject.absPath, c.fileStats.size);
      sharedSize += c.fileStats.sharedSize || 0;
      if(c.occurances.length === 1) {
        sSize += c.fileStats.sSize;
      } else {
        sharedSize += c.fileStats.size / c.occurances.length;
      }
    });
  }
  sSize += fSize;
  if(store[filePath]) {
    store[filePath].fileStats.nSize = sSize + sharedSize;
    store[filePath].fileStats.sharedSize = sharedSize;
    store[filePath].fileStats.sSize = sSize;
  }
  return { sSize, sharedSize };
}
function toTableArray(group, initialIndexSize, indexPath) {
  let netIndexSize = initialIndexSize;
  const arr = [];
  const indexDir = path.dirname(indexPath);
  _.each(group.local, (ast) => {
    netIndexSize += ast.fileStats.size;
    const fSize = filesize(ast.fileStats.size, { base: 10 });
    const nSize = filesize(ast.fileStats.nSize, { base: 10 });
    const sSize = filesize(ast.fileStats.sSize, { base: 10 });
    const absPath = ast.urlObject.absPath;
    const relPath = path.relative(indexDir, absPath);
    const occurances = getOccurances(ast.occurances, indexDir);
    arr.push({
      arr : [ast.tagName, relPath, nSize, sSize, fSize, occurances],
      detail: { size: ast.fileStats.sSize  },
    });
  });
  _.each(group.external, (ast) => {
    const absPath = ast.urlObject.absPath;
    const occurances = getOccurances(ast.occurances, indexDir);
    arr.push({
      arr : [ast.tagName, absPath, 'NA', 'NA', 'NA', occurances],
      detail: { size: 0 },
    });
  });
  return arr;
}

function getOccurances(occurances, dirname) {
  const o = occurances[0];
  const parent = path.relative(dirname, o.filePath);
  const others = occurances.length - 1;
  return others ? `${parent} and ${others} more`: parent;
}

function breakLine(str, i) {
  const cW = colWidths[i + 1] - 2; // 2 for padding
  const bL = cW > 0 ? cW : 1;
  const r = new RegExp(`.{1,${cW}}`, 'g');
  const m = str.match(r);
  return m ? m.join('\n') : '';
}
