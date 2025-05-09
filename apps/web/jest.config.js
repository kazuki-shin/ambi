module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: [
    // '@testing-library/jest-native/extend-expect', // jest-native matchers are often included in @testing-library/react-native now
    './jest.setup.js' // For jest-axe or other global setups
  ],
  // transformIgnorePatterns can be problematic, jest-expo provides good defaults.
  // Add specific modules here if they cause issues, e.g.:
  // transformIgnorePatterns: [
  //   "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*))"
  // ],
  moduleNameMapper: {
    // Handle module path aliases if you have them, e.g., for '@/components/*':
    // '^@/(.*)$': '<rootDir>/src/$1'
  },
  // testEnvironment: 'jsdom', // jest-expo default is usually fine, but jest-axe might prefer jsdom.
                               // If issues arise, consider setting this explicitly.
}; 