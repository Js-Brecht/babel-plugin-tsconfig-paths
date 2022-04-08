module.exports = {
  presets: [
    [require.resolve('@babel/preset-env'), {
      targets: {
        node: 'current'
      },
      modules: 'cjs'
    }],
    [require.resolve('@babel/preset-typescript'), {
      allExtensions: true,
      allowNamespaces: true
    }]
  ]
}
