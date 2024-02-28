module.exports = {
  extends: [
    "plugin:react-hooks/recommended",
    require.resolve("@your_spotify/dev/.eslintrc.js"),
  ],
  rules: {
    "react/react-in-jsx-scope": "off",
  },
};
