# gulp-marked-mustache

Markdown with [Mustache](https://mustache.github.io/) templates populated using YAML front-matter.

## Installation

```
$ npm install --save-dev gulp-marked-mustache
```

## Basic usage

```
'use strict';

var gulp = require('gulp');
var markedMustache = require('gulp-marked-mustache');

gulp.task('markdown', function () {
  gulp.src('./markdown/*.md')
    .pipe(markedMustache())
    .pipe(gulp.dest('./dist'));
});
```

## Options

### API

This package uses [marked](https://github.com/chjj/marked), [Mustache.js](https://github.com/janl/mustache.js) and [node-toc](https://github.com/cowboy/node-toc), although with
slightly different defaults. You can pass through options for most of these components.

#### markdown

Accepts any valid [marked](https://github.com/chjj/marked) options.

#### partials

An object containing any [Mustache](http://mustache.github.io/) partials. This correlates with the `partials` parameter in the `Mustache.render()` method. Note that the other two parameters, `template` and `view`, are populated automatically based on the Markdown file's front matter and content.

#### templatePath

The path to the Mustache templates, including trailing slash. Defaults to `./default/`

#### toc

Accepts any valid [node-toc](https://github.com/cowboy/node-toc) options. Set to `false` to globally disable inclusion.

### Front Matter

All front matter in markdown is added to the Mustache view. In addition, the `template` field will select the corresponding Mustache template, while the `toc` field can be set to `false` to prevent the table of contents from being included.

### Mustache templating

Almost any fields added to the Markdown file's front matter are accessible within the template.

The two exception are `body` and `toc`. The former contains the rendered HTML of the markdown body; the latter either contains the raw HTML of the table of contents, or is not present if the table of contents is not included.

At its simplest, your template may look something like this:

```html
<html>

    <head>

        <title>{{title}}</title>

    </head>

    <body>

        {{{body}}}

        {{{toc}}}

    </body>

</html>
```

Note the triple mustache on the `body` and `toc` variables, as these are raw HTML.
