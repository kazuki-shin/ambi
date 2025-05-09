module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "eslint-config-prettier" // Must be last to override other configs
  ],
  plugins: [
    "@typescript-eslint",
    "react",
    "react-hooks"
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  settings: {
    react: {
      version: "detect" // Automatically detect the React version
    }
  },
  rules: {
    // Add any project-specific rules here
    "react/react-in-jsx-scope": "off", // Not needed with React 17+ new JSX transform
    "@typescript-eslint/explicit-module-boundary-types": "off", // Can be a bit noisy for quick dev
    // You might want to enable this later for stricter checks:
    // "@typescript-eslint/no-explicit-any": "warn", 
  }
}; 