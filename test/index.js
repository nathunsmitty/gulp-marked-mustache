/* eslint-env node, mocha */
var assert = require('assert');
var es = require('event-stream');
var fm = require('front-matter');
var fs = require('fs');
var File = require('vinyl');
var gutil = require('gulp-util');
var marked = require('marked');
var markedMustache = require('../');
var mustache = require('mustache');
var path = require('path');
var toc = require('toc');

require('should');

var markdownDefaults = require('../defaults/marked');
var tocDefaults = require('../defaults/toc');

var testTemplatePath = path.resolve(__dirname, 'fixtures', 'templates');


// Read a mustache template
var getTemplate = function (name) {
  var templatePath = path.resolve(testTemplatePath, name + '.mustache');
  var templateContent = fs.readFileSync(templatePath, {encoding: 'utf8'});

  return templateContent;
};


describe('gulp-marked-mustache', function() {
  describe('markedMustache()', function() {
    it('should work in buffer mode', function (done) {
      var testFile = new gutil.File({
        contents: new Buffer('Buffer content')
      });

      var myMarkedMustache = markedMustache({
        templatePath: testTemplatePath
      });

      myMarkedMustache.once('data', function (file) {
        assert(file.isBuffer());
      });

      myMarkedMustache.once('end', function () {
        done();
      });

      myMarkedMustache.write(testFile);
      myMarkedMustache.end();
    });

    it('should emit error on streamed file', function (done) {
      var testFile = new File({
        contents: es.readArray(['Stream content'])
      });

      var myMarkedMustache = markedMustache();

      myMarkedMustache.once('error', function (err) {
        err.message.should.eql('Streaming not supported');
        done();
      });

      myMarkedMustache.once('end', function () {
        done();
      });

      myMarkedMustache.write(testFile);
      myMarkedMustache.end();
    });

    it('should use the default template if no template is specified', function (done) {
      var testFile = new gutil.File({
        contents: new Buffer('This content will not appear in the result')
      });

      var template = getTemplate('default');

      var myMarkedMustache = markedMustache({
        templatePath: testTemplatePath
      });

      myMarkedMustache.once('data', function (file) {
        assert.equal(file.contents.toString('utf8'), template);
      });

      myMarkedMustache.once('end', function () {
        done();
      });

      myMarkedMustache.write(testFile);
      myMarkedMustache.end();
    });

    it('should use the custom template specified in the front-matter', function (done) {
      var templateName = 'custom-template';
      var testFile = new gutil.File({
        contents: new Buffer('---\ntemplate: ' + templateName + '\n---\nMarkdown goes here.'),
        path: 'test.md'
      });

      var template = getTemplate(templateName);

      var myMarkedMustache = markedMustache({
        templatePath: testTemplatePath
      });

      myMarkedMustache.once('data', function (file) {
        assert.equal(file.contents.toString('utf8'), template);
      });

      myMarkedMustache.once('end', function () {
        done();
      });

      myMarkedMustache.write(testFile);
      myMarkedMustache.end();
    });

    it('should make the rendered markdown available in the `body` attribute', function (done) {
      var templateName = 'body';
      var markdown = '# Hello World\n This is some markdown.';
      var testFile = new gutil.File({
        contents: new Buffer('---\ntemplate: ' + templateName + '\n---\n' + markdown)
      });

      var template = getTemplate(templateName);

      var body = marked(markdown, markdownDefaults);

      var result = mustache.render(template, {body: body});

      var myMarkedMustache = markedMustache({
        templatePath: testTemplatePath
      });

      myMarkedMustache.once('data', function (file) {
        assert.equal(file.contents.toString('utf8'), result);
      });

      myMarkedMustache.once('end', function () {
        done();
      });

      myMarkedMustache.write(testFile);
      myMarkedMustache.end();
    });

    it('should make the rendered ToC available in the `toc` attribute', function (done) {
      var templateName = 'toc';
      var markdown = '# Page title\n## Subheading 1\n ##Subheading 2';
      var testFile = new gutil.File({
        contents: new Buffer('---\ntemplate: ' + templateName + '\n---\n' + markdown)
      });

      var template = getTemplate(templateName);

      var body = marked(markdown, markdownDefaults);

      var tocData = toc.anchorize(body, tocDefaults);
      var tocHtml = toc.toc(tocData.headers, tocDefaults);

      var result = mustache.render(template, {toc: tocHtml});

      var myMarkedMustache = markedMustache({
        templatePath: testTemplatePath
      });

      myMarkedMustache.once('data', function (file) {
        assert.equal(file.contents.toString('utf8'), result);
      });

      myMarkedMustache.once('end', function () {
        done();
      });

      myMarkedMustache.write(testFile);
      myMarkedMustache.end();
    });

    it('should make the front-matter attributes available in the template', function (done) {
      var templateName = 'attributes';
      var attributes  = {
        firstAttribute: 'foo',
        secondAttribute: 'bar',
        nested: {
          attribute: 'blah'
        }
      };
      var frontMatter = 'firstAttribute: foo\nsecondAttribute: bar\nnested:\n  attribute: blah';
      var markdown = '# Hello World\n This is some markdown.';
      var testFile = new gutil.File({
        contents: new Buffer('---\ntemplate: ' + templateName + '\n' + frontMatter + '\n---\n' + markdown)
      });

      var template = getTemplate(templateName);

      var result = mustache.render(template, attributes);

      var myMarkedMustache = markedMustache({
        templatePath: testTemplatePath
      });

      myMarkedMustache.once('data', function (file) {
        assert.equal(file.contents.toString('utf8'), result);
      });

      myMarkedMustache.once('end', function () {
        done();
      });

      myMarkedMustache.write(testFile);
      myMarkedMustache.end();
    });
  });
});
