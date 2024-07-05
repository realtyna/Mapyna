const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin")

const config = () => {
  const config = {
    mode: "production",
    entry: {
      index: "./src/index.ts"
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      library: "$",
      libraryTarget: "umd",
      clean: true
    },

    module: {
      rules: [
        {
          test: /\.(jsx|js|ts|tsx)$/,
          include: path.resolve(__dirname, "src"),
          exclude: /node_modules/,
          use: [
            {
              loader: "babel-loader"
            },
            {
              loader: "ts-loader"
            }
          ]
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"]
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/index.html",
        filename: "index.html",
        inject: "body"
      })
    ],
    devServer: {
      static: "./dist",
      hot: true,
      open: true,
      port: 9091
    },
    optimization: {
      minimize: true,
      minimizer: [`...`, new CssMinimizerPlugin()]
    },
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    },
    resolve: {
      extensions: [".js", ".jsx", ".ts", ".tsx"]
    }
  }

  return config
}

module.exports = config
