'use strict';

// Load Dependencies
var _ = require('lodash');
var fm = require('front-matter');   // Extract data from markdown front-matter
var fs = require('fs');             // Read files
var hljs = require('highlight.js'); // Syntax highlighting
var marked = require('marked');     // Convert Markdown to HTML convert
var mustache = require('mustache'); // Convert Jade templates to HTML
var through = require('through2');  // Wrapper for stream
var toc = require('toc');           // Generate a ToC, if required

var markdownDefaults = {
  highlight: function(code, lang) {
    if (typeof lang !== 'undefined') {
      code = hljs.highlight(lang, code).value;
    }
    return code;
  },
  langPrefix: 'hljs '
};

var markedMustacheDefaults = {
  templatePath: './templates/'
};

var tocDefaults = {
  headers: /<h(\d)(\s*[^>]*[^>]*)>(?!TL\;DR)([\s\S]+?)<\/h\1>/gi,  // Exlcude headings called 'TL;DR'
  header: '<h<%= level %><%= attrs %> id="<%= anchor %>"><%= header %></h<%= level %>>',
  openLI: '<li><a href="#<%= anchor %>"><%= text %></a>',
  openUL: '<ul>',
  TOC: '<%= toc %>',
  tocMax: 3
};

// Render markdown. Applies different defaults to standard marked.
var renderMarkdown = function (markdown, options) {
  // Merge defaults with user options
  options = _.merge({}, markdownDefaults, options);

  options.renderer = new marked.Renderer();

  // Override marked settings so IDs aren't added to headings
  options.renderer.heading = function (text, level) {
    return '<h' + level + '>' + text + '</h' + level + '>\n';
  };

  // Return the processed markdown
  return marked(markdown, options);
};

// Render a Table of Contents. Returns processed HTML and ToC.
var renderToc = function (html, options) {
  var data;
  var output = {};

  // Merge defaults with user options
  options = _.merge({}, tocDefaults, options);

  // Analyse the HMTL and generate ToC data
  data = toc.anchorize(html, options);

  // Set the output HTML to the anchorised HTML
  output.body = data.html;

  // Generate ToC HTML based on the ToC headers
  output.toc = toc.toc(data.headers, options);

  return output;
};

var loadTemplate = function (template) {
  return fs.readFileSync(template, 'utf-8');
};

var gulpMarkedMustache = function (options) {
  // Initialise options
  options = _.merge({}, markedMustacheDefaults, options);

  return through.obj(function(file, enc, cb) {
    var data = fm(String(file.contents));
    var html;
    var localOptions = {}; // Per file options passed through front matter
    var path = (typeof data.attributes.path !== 'undefined') ? file.base + data.attributes.path : file.path.replace(/\.md$/, '.html');
    var template;               // Mustache template (NOT template path)
    var tocTemp;                // Temporary ToC data, if required
    var view = data.attributes; // Set view data to that in file's front-matter

    // Set special local options from front matter
    localOptions.template = _.get(data, 'attributes.template', 'default');
    localOptions.toc = _.get(data, 'attributes.toc', true);

    // Convert markdown to HTML
    view.body = renderMarkdown(data.body);

    // Update the Markdown links to their HTML equivalent
    if (options.updateLinks !== false) {
      view.body = view.body.replace(/href=\"(.+?)(\.md)([\?\#].+?)?\"/g, function (match, path, extension, queryFragment) {
        // If there is no query string or fragment, set the variable
        // to a zero-length string
        if (typeof queryFragment === 'undefined') {
          queryFragment = '';
        }

        // Don't update the link if it includes a protocol
        if ((/^(\w+\:)?\/\//).test(path)) {
          return match;
        } else {
          return 'href="' + path + '.html' + queryFragment + '"';
        }
      });
    }

    // Add a ToC, if required
    if (options.toc !== false) {
      if (localOptions.toc !== false) {
        // Get to ToC HTML
        tocTemp = renderToc(view.body, options.toc);

        // Set the appropriate view properties to the corresponding ToC HTML
        view.body = tocTemp.body;
        view.toc = tocTemp.toc;
      } else {
        delete view.toc;  // Remove the toc property from the view data
      }
    }

    // Read the template
    template = loadTemplate(options.templatePath + localOptions.template + '.mustache');

    // Compile the template
    html = mustache.render(template, view, options.partials);

    // Set the path and contents
    file.path = path;
    file.contents = new Buffer(html);

    cb(null, file);
  });
};

module.exports = gulpMarkedMustache;
