import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
    { ignores: ["dist/**"] }, // 顶级配置，排除构建产物目录
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
                    ignoreRestSiblings: true,
                    varsIgnorePattern: "^_" // 忽略下划线开头的变量
                }],
            "prefer-destructuring": ["error", {
                "array": false,
                "object": true
            }],
            "padding-line-between-statements": "off",// 禁用语句之间的填充行规则，
            "no-warning-comments": ["off", {
                "terms": ["TODO", "FIXME", "HACK"],
                "location": "start"
            }],
            // 函数复杂度和行数限制
            "complexity": ["error", {
                "max": 10
            }],
            // 最大嵌套深度，影响时间复杂度
            "max-depth": ["error", {
                "max": 4
            }],
            // 函数最大参数数量，影响函数复杂度
            "max-params": ["error", {
                "max": 5
            }],
            // 函数最大语句数量，影响时间复杂度
            "max-statements": ["error", {
                "max": 30
            }],
            // 每行最大语句数量
            "max-statements-per-line": ["error", {
                "max": 1
            }],
            // 最大嵌套回调数量，影响时间复杂度
            "max-nested-callbacks": ["error", {
                "max": 3
            }],
            // 函数最大行数，间接影响复杂度
            "max-lines-per-function": ["error", {
                "max": 50,
                "skipComments": true,
                "skipBlankLines": true
            }],
            // 禁止嵌套三元表达式，简化逻辑
            "no-nested-ternary": "error",
            // 代码行最大长度，提高可读性
            "max-len": ["warn", {
                "code": 150,
                "tabWidth": 4,
                "ignoreComments": true
            }],
        }
    },
    // 为 webpack 配置文件添加例外，允许使用 require() 导入
    {
        files: ["config/**/*.js"],
        rules: {
            "@typescript-eslint/no-require-imports": "off"
        }
    },
    // 为 ThreadPool.ts 和 retryWrapper.ts 中的动态导入添加例外
    {
        files: ["src/core/ThreadPool.ts", "src/utils/retryWrapper.ts"],
        rules: {
            "@typescript-eslint/no-require-imports": "off"
        }
    },
    // 为类型定义文件添加例外，禁用未使用变量检查
    {
        files: ["types/**/*.d.ts"],
        rules: {
            "@typescript-eslint/no-unused-vars": "off"
        }
    },
    // 为测试文件添加例外，允许使用 any 类型
    // 为类型定义文件添加例外，禁用未使用变量检查
    {
        files: ["types/**/__tests__/**/*.ts"],
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "max-lines-per-function": "off"
        }
    },
    // 为接口定义文件添加例外，调整 semi 规则
    {
        files: ["src/db/interface/**/*.ts"],
        rules: {
            semi: "off"
        }
    }
];