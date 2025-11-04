// CRACO Configuration para suprimir warnings de source maps
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Suprimir warnings de source maps de node_modules
      webpackConfig.ignoreWarnings = [
        {
          module: /stylis-plugin-rtl/,
        },
        function ignoreSourcemapsloaderWarnings(warning) {
          return (
            warning.module &&
            warning.module.resource &&
            warning.module.resource.includes("node_modules") &&
            warning.details &&
            warning.details.includes("source-map-loader")
          );
        },
      ];
      return webpackConfig;
    },
  },
};
