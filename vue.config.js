// vue.config.js
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  lintOnSave: false,
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'assets',
  indexPath: 'index.html',
  filenameHashing:true,
  pages: {
      index: {
          entry: "./src/pages/index/index.js", // 配置入口js文件
          template: "./src/pages/index/index.html", // 主页面
          filename: "index.html", // 打包后的html文件名称
          title: "首页", // 打包后的.html中<title>标签的文本内容
          // 在这个页面中包含的块，默认情况下会包含
          // 提取出来的通用 chunk 和 vendor chunk。
          chunks: ['chunk-vendors', 'chunk-common', 'index']
      }
  },
  configureWebpack: config => {
    const cwp = new CopyWebpackPlugin([
      {
        // from: './src/assets/scripts/Cesium', // 调试时，将Cesium换成CesiumUnminified
        from: './node_modules/cesium/Build/Cesium',
        to: 'js/Cesium',
        toType: 'dir'
      },
      {
        // from: './src/assets/scripts/XbsjCesium',
        from: './node_modules/earthsdk/dist/XbsjCesium',
        to: 'js/earthsdk/XbsjCesium',
        toType: 'dir'
      },
      {
        // from: './src/assets/scripts/XbsjEarth',
        from: './node_modules/earthsdk/dist/XbsjEarth',
        to: 'js/earthsdk/XbsjEarth',
        toType: 'dir'
      },
    ]);
    config.plugins.push(cwp);
  }
}