module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es2021: true,
    },
    extends: [
        'airbnb-base',
    ],
    parserOptions: {
        ecmaVersion: 12,
    },
    parser: 'babel-eslint',
    rules: {
        'arrow-body-style': ['error', 'as-needed'],
        'arrow-parens': ['error', 'as-needed'],
        'array-callback-return': 'off',
        'no-plusplus': 'off',
        'class-methods-use-this': 'off',
        'no-useless-constructor': 'warn',
        'no-empty-function': 'warn',
        'no-unused-vars': 'warn',
        'no-return-await': 'off',
        'no-underscore-dangle': 'off',
        'max-len': 'warn',
        indent: ['error', 4],
    },
};
