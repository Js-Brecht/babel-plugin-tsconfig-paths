const path = require('path')

module.exports = ({
  verbose: true,
  transform: {
    '\\.m?[jt]sx?$': require.resolve('babel-jest')
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    path.join(__dirname, 'tests', '?(*.)+(spec|test).[jt]s?(x)')
  ]
})
