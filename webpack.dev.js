//开发时用的webpack配置
const merge = require('webpack-merge');
const vueConfigs = require('./webpack.vue.config');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// const WorkboxPlugin = require('workbox-webpack-plugin'); // PWA
// const OfflinePlugin = require('offline-plugin');
const webpack = require('webpack');
const apiMocker = require('webpack-api-mocker');
const path = require('path');
const helper = require('./helper');
const conf = require('./bin/conf');
const CWD = process.cwd();
//获取命令行最后一个参数
const domainsArgv = process.argv[process.argv.length - 1];
const domains = conf.domains;
global.nomocker = conf.nomocker;

delete conf.nomocker;
delete conf.domains;
delete conf.port;

// 处理多个环境请求域名不同时, st:cjs
if (/:/.test(domainsArgv)) {
  let domainsArgvArr = domainsArgv.split(':');
  //设置全局域名
  global.domain = domains[domainsArgvArr[domainsArgvArr.length - 1]];
  
}

module.exports = merge(
  vueConfigs,
  {
    devtool: 'cheap-eval-source-map',
    mode: 'development',
    optimization: {
      minimize: false,
      splitChunks: {
        cacheGroups: {
          commons: {
            name: 'commons',
            chunks: 'initial',
            minChunks: 4,
          },
        },
      },
    },
    plugins: [
      new ExtractTextPlugin('styles.css'),
      new webpack.NamedModulesPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.DefinePlugin({
        MOCK: conf.mock || true,
      }),
      new CopyWebpackPlugin([
        {
          from: path.join(CWD, './static'),
          to: 'static',
          ignore: ['.*'],
        },
      ]),
      // pwa: https://webpack.js.org/guides/progressive-web-application/#root
      // new WorkboxPlugin.GenerateSW({
      //     // these options encourage the ServiceWorkers to get in there fast
      //     // and not allow any straggling "old" SWs to hang around
      //     clientsClaim: true,
      //     skipWaiting: true,
      // }),
      // new OfflinePlugin()
    ],
  },
  conf,
  {
    output: {
      path: helper.resolve('_debug'),
      publicPath: '/',
      filename: 'static/js/[name].[hash].js',
      globalObject: 'this',
    },
  }
);
