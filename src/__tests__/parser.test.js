import assert from 'assert';
import path from 'path';
import { parse } from '../parser';

const polymerUrl = 'bower_components/polymer/polymer.html';
const localUrlFn = function(ext, bower, componentName = 'custom-element') {
  let url =  bower ? 'bower_components/' : '';
  url += `${componentName}/${componentName}.${ext}`;
  return url;
}
const externalUrlFn = function(ext) {
  return  `https://example.com/path/to/file-name.${ext}`;
}

describe('link', function () {
  it('returns local href correctly', function () {
    const href = localUrlFn('html', true);
    const absPath = path.resolve('', href);
    const html = `<link href="${href}" rel="import">`;
    const store = parse(html, {}, 'test.js');
    const links = Object.keys(store);
    const link = links[0];
    const linkAST = store[link];
    assert.equal(absPath, link);
    assert.equal(href, linkAST.urlObject.href);
    assert.equal(true, linkAST.urlObject.local);
  });
  it('returns external href correctly', function () {
    const href = externalUrlFn('html', true);
    const html = `<link href="${href}" rel="import">`;
    const store = parse(html, {}, 'test.js');
    const links = Object.keys(store);
    const link = links[0];
    const linkAST = store[link];
    assert.equal(href, link);
    assert.equal(false, linkAST.urlObject.local);
  });
});


describe('script', function () {
  it('returns local src correctly', function () {
    const href = localUrlFn('js', true);
    const html = `<script src="${href}">blah</script>`;
    const store = parse(html, {}, 'test.js');
    const links = Object.keys(store);
    const link = links[0];
    const linkAST = store[link];
    assert.equal(href, linkAST.urlObject.href);
    assert.equal(true, linkAST.urlObject.local);
  });
  it('returns external href correctly', function () {
    const href = externalUrlFn('js', true);
    const html = `<script src="${href}">blah</script>`;
    const store = parse(html, {}, 'test.js');
    const links = Object.keys(store);
    const link = links[0];
    const linkAST = store[link];
    assert.equal(href, link);
    assert.equal(false, linkAST.urlObject.local);
  });
  it('skips script without src', function () {
    const html = `<script>blah</script>`;
    const store = parse(html, {}, 'test.js');
    const links = Object.keys(store);
    assert.equal(0, links.length);
  });
});
