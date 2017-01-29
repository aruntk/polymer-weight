import path from 'path';
import fs from 'fs';
import * as _ from 'lodash';
import parser from '..';

let store = {};
export const parseFile = function(filePath, result) {
  store = result;
  const html = fs.readFileSync(filePath);
  parser.parse(html, store, filePath);
  const links = _.keys(store);
  return Promise.all(links.map(processLinks));
}

export const attachStats = function(link) {
  const ast = store[link];
  return new Promise((resolve, reject) => {
    fs.stat(ast.urlObject.absPath, (err, data) => {
      if (err) {
        ast.status = 'error';
        reject(err);
      }
      resolve(data);
    });
  });
}
export const readFile = function(link) {
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
export const processLinks = function(link, i) {
  const ast = store[link];
  if(!ast.status && ast.urlObject.local) {
    ast.status = 'working';
    const statsPromise = attachStats(link);
    return Promise.all([attachStats(link), readFile(link)]);
  }
}

