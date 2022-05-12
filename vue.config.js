const { defineConfig } = require('@vue/cli-service')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

console.log('Environment:', process.env.NODE_ENV)

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [new NodePolyfillPlugin()],
  },
  publicPath: process.env.NODE_ENV === 'production' ? '/macier/' : '/',
})
