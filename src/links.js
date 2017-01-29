import path from 'path';
import fs from 'fs';
import * as _ from 'lodash';
import { parse } from './parser';

let store = {};
export const parseFile = function(filePath, result) {
  store = result;
  const html = fs.readFileSync(filePath, "utf8",);
  return processHTML(html, filePath);
}
const processHTML = function(html, filePath) {
  parse(html, store, filePath);
  const links = _.keys(store);
  const values = _.values(store);
  let p = [];
  if(_.find(values, value => !value.status)) {
    p = links.map(processLinks);
  }
  return Promise.all(p);
}
export const attachStats = function(link) {
  const ast = store[link];
  return new Promise((resolve, reject) => {
    fs.stat(ast.urlObject.absPath, (err, data) => {
      if (err) {
        ast.status = 'error';
        reject(err);
      }
      ast.fileStats = data;
      resolve(data);
    });
  });
}
export const readFile = function(link) {
  const ast = store[link];
  return new Promise((resolve, reject) => {
    fs.readFile(link, "utf8", (err, data) => {
      if (err) {
        reject(err);
      }
      ast.fileContents = data;
      processHTML(data, link).then(function() {
        resolve();
      });
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

