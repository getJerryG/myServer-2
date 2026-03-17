import type { Config } from "jest";

const config: Config = {
    // 模块路径映射
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
        "^~/(.*)$": "<rootDir>/types/$1",
        "^models/(.*)$": "<rootDir>/src/models/$1"
    },
    // 使用Node.js环境
    testEnvironment: "node",
    // 测试文件匹配模式
    testMatch: ["**/__tests__/**/*.+(ts|tsx|js)", "**/?(*.)+(spec|test).+(ts|tsx|js)"],
    // 排除不需要测试的文件
    testPathIgnorePatterns: ["<rootDir>/src/test.ts"],
    // 使用ts-jest转换TypeScript文件
    transform: {
        "^.+(ts|tsx)$": "ts-jest"
    },
    // 模块文件扩展名
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    // 清除模拟
    clearMocks: true,
    // 收集覆盖率
    collectCoverage: true,
    // 覆盖率目录
    coverageDirectory: "coverage",
    // 覆盖率报告格式
    coverageReporters: ["text", "lcov"],
    // 重置模拟
    resetMocks: true
};

export default config;
