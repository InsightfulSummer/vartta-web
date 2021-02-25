module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
  extends: [
    '@nuxtjs',
    'prettier',
    'prettier/vue',
    'plugin:prettier/recommended',
    'eslint:recommended',
    'plugin:nuxt/recommended',
    'plugin:vue/base',
  ],
  plugins: ['prettier', 'vuetify'],
  // add your custom rules here
  rules: {
    'vuetify/grid-unknown-attributes': 'error',
    'vuetify/no-legacy-grid': 'error',
    'vuetify/no-deprecated-classes': 'error',
  },
}
