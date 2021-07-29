const path = require("path");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: {
    "xdb-digitalbits-sdk": "./src/browser.ts",
    "xdb-digitalbits-sdk.min": "./src/browser.ts",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    library: "DigitalBitsSdk",
    umdNamedDefine: true,
  },
  resolve: {
    extensions: [".js", ".json", ".ts"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
          },
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules\/(?!(crc)\/).*/,
        use: [
          {
            loader: "babel-loader",
          },
        ],
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        test: /\.min\.js$/,
      }),
    ],
  },
  plugins: [
    // Ignore native modules (ed25519)
    new webpack.IgnorePlugin(/ed25519/),
  ],
};
