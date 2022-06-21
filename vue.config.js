const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  configureWebpack: {
    plugins: [
      new CopyWebpackPlugin([
        {
          from: path.join(__dirname, "src/functions"),
          to: path.join(
            __dirname,
            "dist",
            process.env.NODE_ENV === "production" ? "build" : "dev",
            process.env.UNI_PLATFORM,
            "functions"
          ),
        },
      ]),
    ],
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()],
    },
  },
};
