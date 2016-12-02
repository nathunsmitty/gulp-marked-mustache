module.exports = {
  env: {
    node: true
  },
  extends: 'eslint:recommended',
  rules: {
    indent: [
      'error',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    quotes: [
      'error',
      'single'
    ],
    'quote-props': [
      'error',
      'as-needed'
    ],
    semi: [
      'error',
      'always'
    ]
  }
};
