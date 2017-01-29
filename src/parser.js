import { parse as parseHTML, treeAdapters } from 'parse5';
import url from 'url';
import path from 'path';
import * as _ from 'lodash';

const defaultOptions = { locationInfo: true };
export const getAST = function(html, options = defaultOptions) {
  const ast =  parseHTML(html, options);
  return ast;
}
export const parse = function(html, store = {}, filePath = null) {
  const ast = getAST(html);
  getLinks(ast, store, filePath);
  return store;
}

export const getLinks = function(ast, store = {}, filePath = null) {
  if(!ast || !ast.childNodes) {
    return store;
  }
  const childNodes = ast.childNodes;
  _.each(childNodes, child => {
    switch (child.tagName) {
      case 'template': {
        const content = treeAdapters.default.getTemplateContent(child);
        getLinks(content, store, filePath);
      }
        break;
      case 'link': {
        const link = processLink(child);
        pushLink(link, store, filePath);
      }
        break;
      case 'script': {
        const link = processScript(child);
        if(link) {
          pushLink(link, store, filePath);
        }
      }
        break;
        // TODO style
        // case 'style': {
        // const links = processStyle(child);
        // if(links) {
        // Object.values(store).concat(link);
        // }
        // }
        // break;

      default: {
        if(child.tagName) {
          getLinks(child, store, filePath);
        }
      }
        break;
    };
  });
  return store;
}
export const pushLink = function(linkAST, store, filePath) {
  if(!linkAST.urlObject) {
    throw new Error(`no href found in link at line ${linkAST.__location.col} in file ${filePath}`);
  }
  const href = linkAST.urlObject.href;
  const __location = linkAST.__location;
  const occurance = {
    filePath,
    __location
  }
  const absPath = linkAST.urlObject.local ? path.resolve(path.dirname(filePath), href): href;

  if(!store[absPath]) {
    const link = _.omit(linkAST, '__location');
    link.occurances = [occurance];
    link.urlObject.absPath = absPath;
    store[absPath] = link;
  } else {
    store[absPath].occurances.push(occurance);
  }
  return store;
}
const orphanAST = function(ast) {
  return _.omit(ast, 'parentNode', 'childNodes');
}
const formatUrl = function(href) {
  const urlObject = url.parse(href);
  urlObject.local = !urlObject.protocol;
  return urlObject;
}
export const processLink = function(ast) {
  const hrefAttr = _.find(ast.attrs, v => v.name === 'href');
  const link = orphanAST(ast); 
  if(hrefAttr) {
    const href = hrefAttr.value;
    link.urlObject = formatUrl(href);
  }
  return link;
}
export const processScript = function(ast) {
  const importSource = _.find(ast.attrs, v => (v.name === 'src'))
  if (importSource && importSource.value) {
    const script = orphanAST(ast);
    script.urlObject = formatUrl(importSource.value);
    return script;
  }
  return;
}
