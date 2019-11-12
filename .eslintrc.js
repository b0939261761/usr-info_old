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
  }
};
