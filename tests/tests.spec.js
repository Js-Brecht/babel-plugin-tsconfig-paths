const path = require('path')
const pluginTester = require('babel-plugin-tester').default
const tsconfigPaths = require('../lib')

const fixturePath = path.join.bind(path, __dirname, '__fixtures__')

pluginTester({
  plugin: tsconfigPaths,
  pluginName: 'babel-resolve-tsconfig-paths',
  title: 'TsConfig Paths Resolver',
  babelOptions: require(fixturePath('babel.config')),

  pluginOptions: {
    rootDir: fixturePath()
  },

  tests: {
    'Performs standard resolutions correctly': {
      pluginOptions: {
        rootDir: fixturePath('standard-resolutions'),
        tsconfig: fixturePath('standard-resolutions', 'tsconfig.json')
      },
      fixture: fixturePath('standard-resolutions', 'src', 'index.ts'),
      snapshot: true
    },

    'Resolves aliases of modules with directories of the same name': {
      pluginOptions: {
        rootDir: fixturePath('module-directory-same-name'),
        tsconfig: fixturePath('module-directory-same-name', 'tsconfig.json')
      },
      fixture: fixturePath('module-directory-same-name', 'src', 'index.ts'),
      snapshot: true
    },

    'Parses tsconfig with comments': {
      pluginOptions: {
        rootDir: fixturePath('tsconfig-comments'),
        tsconfig: fixturePath('tsconfig-comments', 'tsconfig.json')
      },
      fixture: fixturePath('tsconfig-comments', 'src', 'index.ts'),
      snapshot: true
    }
  }
})
