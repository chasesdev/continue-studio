module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel"
    ]
    // Reanimated plugin is configured via Expo preset; do not duplicate here unless necessary.
  };
};