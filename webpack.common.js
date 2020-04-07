'use strict';

const path = require('path');
const chalk = require('chalk');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');

const utils = require('./src/js/utils');

const devMode = process.env.NODE_ENV !== 'production';

function generateProgressBarPlugin (name) {
  const building = chalk.bold(`Building ${name} page...`);
  const bar = chalk.bgBlue.white.bold('[:bar]');
  const percent = chalk.bold.green(':percent');
  const elapsed = chalk.bold('(:elapsed seconds)');

  return new ProgressBarPlugin({
    format: `   ${building} ${bar} ${percent} ${elapsed}`,
    clear: false,
  });
}

function generateConfig (name, entry) {
  return {
    name,
    entry: {
      // @see - https://github.com/webpack-contrib/webpack-serve/issues/27
      [name]: [
        entry,
      ],
    },
    output: {
      path: path.resolve(
        __dirname,
        'dist'
      ),
      filename: '[name].js',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader?cacheDirectory=true',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  exclude: [
                    '@babel/plugin-transform-typeof-symbol',
                  ],
                },
              ],
            ],
            plugins: [
              '@babel/plugin-syntax-dynamic-import',
              '@babel/plugin-proposal-object-rest-spread',
              '@babel/plugin-proposal-class-properties',
            ],
          },
          // @see - https://github.com/webpack/webpack/issues/2031
          include: [
            path.resolve(
              __dirname,
              'src'
            ),
            path.resolve(
              __dirname,
              'demo'
            ),
            // @see - https://github.com/visionmedia/debug/issues/668
            path.resolve(
              __dirname,
              'node_modules',
              'debug'
            ),
            path.resolve(
              __dirname,
              'node_modules',
              '@skylineos',
              'clsp-player'
            ),
            function (filepath) {
              return filepath.includes('clsp-player');
            },
          ],
        },
        // @see - https://github.com/bensmithett/webpack-css-example/blob/master/webpack.config.js
        {
          test: /\.(eot|svg|ttf|woff|woff2)$/,
          loader: 'url-loader',
        },
        {
          // @see - https://github.com/webpack-contrib/mini-css-extract-plugin
          // @see - https://github.com/webpack-contrib/sass-loader
          test: /\.(sa|sc|c)ss$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: devMode,
              },
            },
            'css-loader',
            // @todo
            // 'postcss-loader',
            'sass-loader',
          ],
        },
      ],
      // noParse: /video.js/
    },
    resolve: {
      alias: {
        '~root': __dirname,
      },
    },
    externals: {
      'video.js': 'videojs',
    },
    plugins: [
      generateProgressBarPlugin(name),
      new MiniCssExtractPlugin({
        filename: devMode
          ? '[name].css'
          : '[name].[hash].css',
        chunkFilename: devMode
          ? '[id].css'
          : '[id].[hash].css',
      }),
      new WriteFilePlugin(),
    ],
  };
}

const srcAdvancedDemoConfig = generateConfig(
  'demo-advanced-src',
  path.resolve(
    __dirname,
    'demo',
    'advanced-src',
    'index.js'
  )
);

delete srcAdvancedDemoConfig.externals['video.js'];

const distAdvancedDemoConfig = generateConfig(
  'demo-advanced-dist',
  path.resolve(
    __dirname,
    'demo',
    'advanced-dist',
    'index.js'
  )
);

delete distAdvancedDemoConfig.externals['video.js'];

module.exports = function () {
  return [
    srcAdvancedDemoConfig,
    distAdvancedDemoConfig,
    generateConfig(
      utils.name,
      path.resolve(
        __dirname,
        'src',
        'js',
        'index.js'
      )
    ),
  ];
};
