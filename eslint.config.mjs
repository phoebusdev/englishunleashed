import { globalImportOrderRule, globalTypeScriptRules, nextJsRules } from "../../../.eslintrc.global.mjs"

// https://github.com/francoismassart/eslint-plugin-tailwindcss/pull/381
// import eslintPluginTailwindcss from "eslint-plugin-tailwindcss"
import eslintPluginImport from "eslint-plugin-import"
import eslintPluginNext from "@next/eslint-plugin-next"
import eslintPluginStorybook from "eslint-plugin-storybook"
import typescriptEslint from "typescript-eslint"

const eslintIgnore = [
  ".git/",
  ".next/",
  "node_modules/",
  "dist/",
  "build/",
  "coverage/",
  "*.min.js",
  "*.config.js",
  "*.d.ts",
]

const config = typescriptEslint.config(
  {
    ignores: eslintIgnore,
  },
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  ...eslintPluginStorybook.configs["flat/recommended"],
  //  https://github.com/francoismassart/eslint-plugin-tailwindcss/pull/381
  // ...eslintPluginTailwindcss.configs["flat/recommended"],
  typescriptEslint.configs.recommended,
  eslintPluginImport.flatConfigs.recommended,
  {
    plugins: {
      "@next/next": eslintPluginNext,
    },
  },
  {
    settings: {
      tailwindcss: {
        callees: ["classnames", "clsx", "ctl", "cn", "cva"],
      },

      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
    rules: {
      // Use global rules for consistency across all projects
      ...globalImportOrderRule,
      ...globalTypeScriptRules,
      // Next.js specific rules
      ...eslintPluginNext.configs.recommended.rules,
      ...eslintPluginNext.configs["core-web-vitals"].rules,
    },
  }
)

export default config
