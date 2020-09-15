const ERROR = 2;

module.exports = {
    env: {
        browser: true,
        node: true,
        es2020: true,
    },
    extends: ['airbnb-typescript'],
    parserOptions: {
        ecmaVersion: 11,
        project: './tsconfig.json',
    },
    rules: {
        'max-len': [ERROR, 100],
        indent: [ERROR, 4, { SwitchCase: 1 }],
        'no-continue': 'off',
        '@typescript-eslint/indent': [ERROR, 4],
    },
};
