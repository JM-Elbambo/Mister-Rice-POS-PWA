const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const WorkboxPlugin = require("workbox-webpack-plugin");

module.exports = (env, argv) => {
  const isProd = argv.mode === "production";

  return {
    entry: "./src/js/index.js",

    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "js/[name].[contenthash].js",
      clean: true,
      publicPath: isProd ? "/Mister-Rice-POS-PWA/" : "/",
    },

    devtool: isProd ? false : "source-map",

    devServer: {
      port: 3000,
      open: true,
      hot: true,
      historyApiFallback: true,
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/index.html",
      }),
      ...(isProd
        ? [
            new CopyWebpackPlugin({
              patterns: [{ from: "public", to: "" }],
            }),
            new WorkboxPlugin.GenerateSW({
              clientsClaim: true,
              skipWaiting: true,
            }),
          ]
        : []),
    ],

    module: {
      rules: [
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: "asset/resource",
        },
      ],
    },
  };
};
