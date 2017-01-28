import assert from 'assert';
import parser from '..';

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
    const html = `<link href="${href}" rel="import">`;
    const links = parser.parse(html, [], 'test.js');
    const link = links[0];
    assert.equal(href, link.urlObject.href);
    assert.equal(true, link.urlObject.local);
  });
  it('returns external href correctly', function () {
    const href = externalUrlFn('html', true);
    const html = `<link href="${href}" rel="import">`;
    const links = parser.parse(html, [], 'test.js');
    const link = links[0];
    assert.equal(href, link.urlObject.href);
    assert.equal(false, link.urlObject.local);
  });
});


describe('script', function () {
  it('returns local src correctly', function () {
    const href = localUrlFn('js', true);
    const html = `<script src="${href}">blah</script>`;
    const links = parser.parse(html, [], 'test.js');
    const link = links[0];
    assert.equal(href, link.urlObject.href);
    assert.equal(true, link.urlObject.local);
  });
  it('returns external href correctly', function () {
    const href = externalUrlFn('js', true);
    const html = `<script src="${href}">blah</script>`;
    const links = parser.parse(html, [], 'test.js');
    const link = links[0];
    assert.equal(href, link.urlObject.href);
    assert.equal(false, link.urlObject.local);
  });
  it('skips script without src', function () {
    const html = `<script>blah</script>`;
    const links = parser.parse(html);
    assert.equal(0, links.length);
  });
});
