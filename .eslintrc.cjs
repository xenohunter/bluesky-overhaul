/* eslint-env node */
module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  parserOptions: {
    project: './tsconfig.json'
  },
  rules: {
    "arrow-parens": "error",
    "indent": ["error", 2],
    "no-empty-function": "off",
    "@typescript-eslint/no-empty-function": "error",
    "@typescript-eslint/no-explicit-any": "off",
    "quotes": "off",
    "@typescript-eslint/quotes": ["error", "single"],
    "semi": "off",
    "@typescript-eslint/semi": ["error", "always"]
  }
};
