import program from 'commander';
import path from 'path';
import fs from 'fs';
import * as _ from 'lodash';
import parser from '..';

program
  .version('0.0.1')
  .option('-p, --path', 'path to starting file/folder')
  .parse(process.argv);

let sourcePath = program.source ? path.resolve(program.source): process.cwd();
const store = {};
try {
  const stat = fs.stat(sourcePath);
  const isDir = stat.isDirectory();
  const indexPath = isDir ? path.resolve(sourcePath, './index.html') : sourcePath;
}
catch(e) {
  throw e;
}

const parseFile = function(filePath, result = store) {
  const html = fs.readFileSync(filePath);
  parser.parse(html, result, filePath);
  const links = _.keys(store);
  Promise.all(links.map(processLinks))
  .then(links.map());
}

function getFiles(link) {
  return new Promise((resolve, reject) => {
    fs.readFile(link, (err, data) => err ? reject(err) : resolve(data));
  });
}
const attachStats = function(link) {
  const ast = store[link];
  return new Promise((resolve, reject) => {
    fs.stat(ast.urlObject.absPath, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}
const readFile = function(link) {
  const ast = store[link];
  return new Promise((resolve, reject) => {
    fs.readFile(link, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}
const processLinks = function(link, i) {
  const ast = store[link];
  if(!ast.status && ast.urlObject.local) {
    ast.status = 'working';
    const statsPromise = attachStats(link);
    return Promise.all([attachStats(link), readFile(link)]);
  }
}

