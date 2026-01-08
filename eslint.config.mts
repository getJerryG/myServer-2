import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: "latest",
            globals: {
                ...globals.node,
                ...globals.es2021
            }
        },
        rules: {
            "no-console": "off",// 禁用 console 语句的警告
            indent: ["error", 4],// 强制使用 4 个空格缩进
            quotes: ["error", "double"],// 强制双引号
            semi: ["error", "always"],// 强制添加分号
            "no-unused-vars": "off",// 禁用未使用变量的警告
            "@typescript-eslint/no-unused-vars": ["warn",
                {
                    argsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                    "ignoreRestSiblings": true // 忽略剩余参数的兄弟项
                }],
            "prefer-destructuring": ["error", {
                "array": false,
                "object": true
            }],
            "padding-line-between-statements": "off"
        }
    }
];