const path = require('path')

module.exports = {
    mode: process.env.NODE_ENV,
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    devServer: {
        contentBase: './dist',
        // publicPath: './dist/',

        hot: true,
        port: 8080,
        proxy: [{
          context: ['/' ,'/graphql'],
          target: 'http://localhost:3000'
        }]
    },
    module: {
        rules: [
          {
            test: /\.jsx?/,
            exclude: /(node_modules)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env', '@babel/preset-react'],
                plugins: ["@babel/plugin-transform-runtime"]
              
              }
            }
          },
          {
              test: /\.css$/,
              use:  ['style-loader', 'css-loader']
          }
        ]
    }
}