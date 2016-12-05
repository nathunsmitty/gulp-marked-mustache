'use strict';

var hljs = require('highlight.js');
var marked = require('marked');

var renderer = new marked.Renderer();

// Stop IDs from being added to headings
renderer.heading = function (text, level) {
  return '<h' + level + '>' + text + '</h' + level + '>\n';
};

module.exports = {
  highlight: function(code, lang) {
    if (typeof lang !== 'undefined') {
      code = hljs.highlight(lang, code).value;
    }
    return code;
  },
  langPrefix: 'hljs ',
  renderer: renderer
};
