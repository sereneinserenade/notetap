module.exports = {
  extends: "airbnb-typescript-prettier",
  rules: {
    "react/react-in-jsx-scope": 0,
    "import/prefer-default-export": 0,
    "react/function-component-definition": 0,
    "import/no-extraneous-dependencies": 0,
    "@typescript-eslint/no-use-before-define": ["warn"],
  },
  ignorePatterns: ["**/*.json", "**/vendor/*.js"],
};
