module.exports = {
  extends: ['expo', 'plugin:jsx-a11y/recommended'],
  plugins: ['jsx-a11y', 'react-native-a11y'],
  env: {
    'jest': true,
  },
  rules: {
    // You can override or add rules here
    // For example, to enable specific react-native-a11y rules:
    // 'react-native-a11y/has-valid-accessibility-descriptors': 'warn',
    // 'react-native-a11y/has-accessibility-props': 'warn',
  },
}; 