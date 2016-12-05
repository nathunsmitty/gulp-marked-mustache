'use strict';

module.exports = {
  headers: /<h(\d)(\s*[^>]*[^>]*)>(?!TL\;DR)([\s\S]+?)<\/h\1>/gi,  // Exlcude headings called 'TL;DR'
  header: '<h<%= level %><%= attrs %> id="<%= anchor %>"><%= header %></h<%= level %>>',
  openLI: '<li><a href="#<%= anchor %>"><%= text %></a>',
  openUL: '<ul>',
  TOC: '<%= toc %>',
  tocMax: 3
};
