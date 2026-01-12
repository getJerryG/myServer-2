/**
 * 通用工具函数集合
 */

import fs from "fs";
import path from "path";

/**
 * 写入JSON文件
 * @param path 文件路径
 * @param data 要写入的数据
 */
export function writeJsonFile(path: string, data: Record<string, unknown>): void {
    try {
        fs.writeFileSync(path, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error writing JSON file:", err);
        throw err;
    }
}

/**
 * 读取JSON文件
 * @param path 文件路径
 * @returns 文件内容
 */
export function readJsonFile<T = any>(path: string): T {
    try {
        const fileData = fs.readFileSync(path, "utf8");
        return JSON.parse(fileData) as T;
    } catch (err) {
        console.error("Error reading JSON file:", err);
        throw err;
    }
}

/**
 * 更新JSON文件
 * @param path 文件路径
 * @param data 要更新的数据
 */
export function updateJsonFile(path: string, data: Record<string, unknown>): void {
    try {
        // 读取现有数据
        const fileData = fs.readFileSync(path, "utf8");
        const parsedData: Record<string, any> = JSON.parse(fileData);
        
        // 合并新数据
        const updatedData = {
            ...parsedData,
            ...(typeof data === "string" ? JSON.parse(data) : data)
        };
        
        // 写入更新后的数据
        fs.writeFileSync(path, JSON.stringify(updatedData, null, 2));
    } catch (err) {
        console.error("Error updating JSON file:", err);
        throw err;
    }
}

/**
 * 追加数据到JSON文件
 * @param path 文件路径
 * @param data 要追加的数据
 */
export function appendToJsonFile(path: string, data: Record<string, unknown>): void {
    try {
        // 读取现有数据
        const fileData = fs.readFileSync(path, "utf8");
        const parsedData: Record<string, unknown>[] = JSON.parse(fileData);
        
        // 确保是数组
        if (!Array.isArray(parsedData)) {
            throw new Error("File content is not an array");
        }
        
        // 追加数据
        parsedData.push(data);
        
        // 写入更新后的数据
        fs.writeFileSync(path, JSON.stringify(parsedData, null, 2));
    } catch (err) {
        console.error("Error appending to JSON file:", err);
        throw err;
    }
}

/**
 * 确保目录存在
 * @param dirPath 目录路径
 */
export function ensureDir(dirPath: string): void {
    try {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    } catch (err) {
        console.error("Error ensuring directory exists:", err);
        throw err;
    }
}

/**
 * 删除文件
 * @param filePath 文件路径
 */
export function deleteFile(filePath: string): void {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (err) {
        console.error("Error deleting file:", err);
        throw err;
    }
}

/**
 * 复制文件
 * @param srcPath 源文件路径
 * @param destPath 目标文件路径
 */
export function copyFile(srcPath: string, destPath: string): void {
    try {
        // 确保目标目录存在
        ensureDir(path.dirname(destPath));
        fs.copyFileSync(srcPath, destPath);
    } catch (err) {
        console.error("Error copying file:", err);
        throw err;
    }
}

/**
 * 移动文件
 * @param srcPath 源文件路径
 * @param destPath 目标文件路径
 */
export function moveFile(srcPath: string, destPath: string): void {
    try {
        // 确保目标目录存在
        ensureDir(path.dirname(destPath));
        fs.renameSync(srcPath, destPath);
    } catch (err) {
        console.error("Error moving file:", err);
        throw err;
    }
}
