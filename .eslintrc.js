module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'airbnb-base',
    'plugin:node/recommended'
  ],
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {
    // require or disallow trailing commas (comma-dangle)
    'comma-dangle': ['error', 'never'],

    //Require parens in arrow function arguments (arrow-parens)
    'arrow-parens': ['error', 'as-needed'],

    // Require Radix Parameter (radix)
    radix: ['error', 'as-needed'],

    // disallow the use of console (no-console)
    'no-console': ['error', { allow: ['info', 'warn', 'error'] } ],

    // disallow the unary operators ++ and -- (no-plusplus)
    'no-plusplus': 'off',

    // Disallow Reassignment of Function Parameters (no-param-reassign)
    'no-param-reassign': ['error', { props: true, ignorePropertyModificationsFor: ['el'] }],

    'no-unused-vars': ['error', { argsIgnorePattern: '^(req|res|next)$' }],

    'no-await-in-loop': 'off',

    'object-curly-newline': ['error', {
      ObjectExpression: { minProperties: 8, multiline: true, consistent: true },
      ObjectPattern: { minProperties: 8, multiline: true, consistent: true },
      ImportDeclaration: { minProperties: 8, multiline: true, consistent: true },
      ExportDeclaration: { minProperties: 8, multiline: true, consistent: true },
    }],

    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message: 'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
      {
        selector: 'LabeledStatement',
        message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
    ],
  }
};
