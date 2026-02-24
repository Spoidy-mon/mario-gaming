module.exports = {
  entry: './src/main.js',  // Or your actual main entry if different
  target: 'electron-main',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  output: {
    path: __dirname + '/.webpack/main',
    filename: 'index.js'
  }
};