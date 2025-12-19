const {
  FlatCompat,
} = require("@eslint/eslintrc");
const js = require("@eslint/js");
const globals = require("globals");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  ...compat.extends("google"),
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es6,
      },
      ecmaVersion: 2018,
      sourceType: "commonjs",
    },
    rules: {
      "quotes": ["error", "double"],
      "max-len": ["error", {
        "code": 120,
      }],
      "valid-jsdoc": "off",
      "require-jsdoc": "off",
    },
  },
];
