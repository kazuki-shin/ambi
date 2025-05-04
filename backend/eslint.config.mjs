import globals from "globals";
import tseslint from "typescript-eslint";
// import pluginReact from "eslint-plugin-react"; // Remove React plugin import
import { defineConfig } from "eslint/config";


export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts}"], // Only lint JS/TS files for backend
    languageOptions: { 
      globals: { 
        ...globals.node, // Use Node.js globals
        ...globals.es2021 
      } 
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ]
    }
  },
  tseslint.configs.recommended,
  // Global ignores applied to all checks
  {
    ignores: [
      "node_modules/",
      "dist/",
      "coverage/"
    ]
  },
  // pluginReact.configs.flat.recommended, // Remove React config
]);