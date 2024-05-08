const path = require('path');

module.exports = {
  entry: './static/app.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    fallback: {
      "string_decoder": require.resolve("string_decoder/"),
      "buffer": require.resolve("buffer/")
    }
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  externals: {
    'iconv-lite': 'iconv-lite' // Informa ao webpack para não incluir 'iconv-lite' no bundle
  }
};
