module.exports = {
  plugins: ['stylelint-prettier'],
  extends: ['stylelint-prettier/recommended', 'stylelint-config-standard'],
  ignoreFiles: ['node_modules/*'],
  rules: {
    'prettier/prettier': [
      true,
      {
        singleQuote: true,
        tabWidth: 2,
      },
    ],
  },
};
