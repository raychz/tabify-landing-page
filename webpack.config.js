const path = require('path');
const HtmlwebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// We need Nodes fs module to read directory contents
const fs = require('fs')

// Our function that generates our html plugins
function generateHtmlPlugins(templateDir) {
  // Read files in template directory
  const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir))
  const plugins = [];
  templateFiles.forEach(item => {
    // Split names and extension
    const parts = item.split('.')
    const name = parts[0]
    const extension = parts[1]
    if (extension === 'html') {
      // Create new HtmlwebpackPlugin with options
      plugins.push(new HtmlwebpackPlugin({
        filename: `${name}.html`,
        template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`)
      }));
    }
  })
  return plugins;
}

// Call our function on our views directory.
const htmlPlugins = generateHtmlPlugins('./src');

module.exports = {
  devtool: 'source-map',
  entry: './src/js/main.js',
  output: {
    filename: 'bundle.js'
  },
  resolve: {
    alias: {
      'node_modules': path.join(__dirname, 'node_modules'),
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.html$/,
        use: 'html-loader'
      },
      {
        test: /\.(jpe?g|png|woff|woff2|eot|ttf|svg)(\?[a-z0-9=.]+)?$/,
        use: 'url-loader?limit=100000'
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: process.env.NODE_ENV === 'development',
            },
          },
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: require.resolve("./src/js/main.js"),
        use: "imports-loader?this=>window"
      }
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    new CopyWebpackPlugin([
      { from: 'src/img', to: 'img' }
    ]),
  ]
    // We join our htmlPlugin array to the end
    // of our webpack plugins array.
    .concat(htmlPlugins),
  devServer: {
    contentBase: path.join('./dist'),
  }
};