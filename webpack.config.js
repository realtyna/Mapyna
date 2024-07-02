const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CopyPlugin = require("copy-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")
const webpack = require("webpack")
const packageJson = require("./package.json")
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin")

const packageVersion = packageJson.version

const config = (env, argv) => {
  const isPro = argv.pro === true

  const config = {
    mode: "production",
    devtool: "source-map",
    entry: {
      index: "./src/index.ts",
      data: "./src/data/index.ts"
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: (chunkData) => {
        const entryName = chunkData.chunk.name
        if (entryName === "index") {
          return `mapyna-${packageVersion}.min.js`
        }
        return "[name].js"
      },
      library: "$",
      libraryTarget: "umd",
      clean: true
    },
    resolve: {
      extensions: [".js", ".jsx", ".ts", ".tsx"]
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
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/index.html",
        filename: "index.html",
        inject: "body"
      }),
      new CopyPlugin({
        patterns: [
          { from: "public/styles.css", to: `mapyna-${packageVersion}.css` }
        ]
      })
    ],
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    },
    devServer: {
      static: "./dist",
      hot: true,
      open: true,
      port: 9091
    },
    optimization: {
      minimize: true,
      minimizer: [`...`, new CssMinimizerPlugin()]
    }
  }

  if (isPro) {
    // Add configuration specific to the pro version
    config.plugins.push(
      new webpack.DefinePlugin({
        PRO_VERSION: JSON.stringify(true)
      })
    )
  } else {
    // Add configuration specific to the free version
    config.plugins.push(
      new webpack.DefinePlugin({
        PRO_VERSION: JSON.stringify(false)
      })
    )
  }

  return config
}

module.exports = config
