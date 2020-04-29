const path = require('path')

module.exports = {
  entry: './src/server.js',
  mode: 'production',
  resolve: {
    extensions: [
      '.js',
      '.json'
    ]
  },
  target: 'node',
  output: {
    filename: 'index.js',
    libraryTarget: 'commonjs',
    path: path.resolve(__dirname, './build')
  }
}
