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
    "comma-dangle": "off",
    "@typescript-eslint/comma-dangle": "error",
    "@typescript-eslint/explicit-function-return-type": "error",
    "indent": ["error", 2],
    "no-empty-function": "off",
    "@typescript-eslint/no-empty-function": "error",
    "@typescript-eslint/no-explicit-any": "off",
    "no-multi-spaces": "error",
    "quotes": "off",
    "@typescript-eslint/quotes": ["error", "single"],
    "semi": "off",
    "@typescript-eslint/semi": ["error", "always"]
  }
};
