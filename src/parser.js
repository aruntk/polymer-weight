import { parse as parseHTML } from 'parse5';
import url from 'url';
import * as _ from 'lodash';

const defaultOptions = { locationInfo: true };
export const getAST = function(html, options = defaultOptions) {
  const ast =  parseHTML(html, options);
  return ast;
}
export const parse = function(html, result = [], filePath = null) {
  const ast = getAST(html);
  getLinks(ast, result, filePath);
  return result;
}

export const getLinks = function(ast, result = [], filePath = null) {
  if(!ast || !ast.childNodes) {
    return result;
  }
  const childNodes = ast.childNodes;
  _.each(childNodes, child => {
    switch (child.tagName) {
      case 'template': {
        const content = treeAdapters.default.getTemplateContent(child);
        parse(content.childNodes);
      }
      case 'link': {
        const link = processLink(child);
        pushLink(link, result, filePath);
      }
        break
      case 'script': {
        const link = processScript(child);
        if(link) {
          pushLink(link, result, filePath);
        }
      }
        break;
        // TODO style
        // case 'style': {
        // const links = processStyle(child);
        // if(links) {
        // result.concat(link);
        // }
        // }
        // break;

      default: {
        if(child.tagName) {
          getLinks(child, result, filePath);
        }
      }
        break;
    };
  });
  return result;
}
const pushLink = function(linkAST, links, filePath) {
  const href = linkAST.urlObject.href;
  const __location = linkAST.__location;
  const occurance = {
    filePath,
    __location
  }
  const prev = _.find(links, (link, i) => {
    if(link.urlObject.href === href) {
      links[i].occurances.push(occurance);
    }
  });
  if(!prev) {
    const link = _.omit(linkAST, '__location');
    link.occurances = [occurance];
    links.push(link)
  }
  return links;
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
  const href = hrefAttr.value;
  link.urlObject = formatUrl(href);
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
