/**
 * 图片异步处理工具
 */

import fs from "fs";
import path from "path";

// MIME类型映射
const mimeTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp"
};

/**
 * 获取文件的MIME类型
 * @param filename 文件名
 * @returns MIME类型
 */
function getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    return mimeTypes[ext] || "application/octet-stream";
}

/**
 * 递归遍历目录，将图片转换为Base64编码
 * @param directory 目录路径
 * @returns 图片数据数组
 */
async function traverseDirectory(directory: string): Promise<string[]> {
    try {
        const results: string[] = [];
        
        // 读取目录内容
        const entries = await fs.promises.readdir(directory, { withFileTypes: true });
        
        // 遍历目录条目
        for (const entry of entries) {
            const itemPath = path.join(directory, entry.name);
            
            if (entry.isDirectory()) {
                // 递归处理子目录
                const subDirResults = await traverseDirectory(itemPath);
                results.push(...subDirResults);
            } else {
                // 处理文件，不需要读取文件内容，只需要路径
                
                // 归一化路径
                const normalizedPath = itemPath.replace("public/", "/");
                results.push(normalizedPath);
            }
        }
        
        return results;
    } catch (err) {
        console.error(`Error traversing directory ${directory}:`, err);
        throw err;
    }
}

/**
 * 加载图片为Base64编码
 * @param directory 图片目录
 * @returns Base64编码的图片数据
 */
export async function loadImagesAsBase64(directory: string): Promise<string[]> {
    try {
        return await traverseDirectory(directory);
    } catch (err) {
        console.error(`Error loading images from ${directory}:`, err);
        return [];
    }
}

/**
 * 将图片转换为Base64编码
 * @param filePath 图片文件路径
 * @returns Base64编码的图片
 */
export async function imageToBase64(filePath: string): Promise<string> {
    try {
        const fileData = await fs.promises.readFile(filePath);
        const base64Data = fileData.toString("base64");
        const mimeType = getMimeType(filePath);
        
        return `data:${mimeType};base64,${base64Data}`;
    } catch (err) {
        console.error(`Error converting image ${filePath} to base64:`, err);
        throw err;
    }
}

/**
 * 删除图片文件
 * @param destinationFolderPath 目标文件夹路径
 * @param imagePaths 要删除的图片路径数组
 */
export async function deleteImages(destinationFolderPath: string, imagePaths: string[]): Promise<void> {
    try {
        console.log("deleteImages", destinationFolderPath, imagePaths);
        
        for (const imagePath of imagePaths) {
            const imageFilePath = path.join(destinationFolderPath, imagePath);
            console.log("deleteImages", imageFilePath);
            
            try {
                await fs.promises.unlink(imageFilePath);
                console.log(`Deleted image: ${imageFilePath}`);
            } catch (err) {
                console.error(`Error deleting image ${imageFilePath}:`, err);
                // 继续删除其他图片
            }
        }
    } catch (err) {
        console.error("Error in deleteImages:", err);
        throw err;
    }
}
