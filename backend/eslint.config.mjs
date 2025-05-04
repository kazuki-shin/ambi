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
    ignores: [ // Add ignores
      "node_modules/", 
      "dist/", 
      "coverage/"
    ]
  },
  tseslint.configs.recommended,
  // pluginReact.configs.flat.recommended, // Remove React config
]);