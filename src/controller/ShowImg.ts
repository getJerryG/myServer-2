import * as fs from "fs";
import * as path from "path";

/**
 * 异步查找目录中的所有图片路径并转换为base64数据URL
 * @param directory 要遍历的目录路径
 * @returns 图片base64数据URL数组
 */
export async function findImagePathsAsync(directory: string): Promise<string[]> {
    const imageExtensions: string[] = [".jpg", ".jpeg", ".png", ".gif"];
    const imageBase64Data: string[] = [];

    /**
     * 递归遍历目录
     * @param currentDir 当前目录路径
     */
    async function traverseDirectory(currentDir: string): Promise<void> {
        try {
            const items: string[] = await fs.promises.readdir(currentDir);
            
            for (const item of items) {
                const itemPath: string = path.join(currentDir, item);
                const stats: fs.Stats = await fs.promises.stat(itemPath);
                
                if (stats.isDirectory()) {
                    // 如果是目录，递归遍历
                    await traverseDirectory(itemPath);
                } else if (stats.isFile()) {
                    // 如果是文件，检查是否为图片
                    const ext = path.extname(item).toLowerCase();
                    if (imageExtensions.includes(ext)) {
                        // 读取文件并转换为base64
                        const fileData = await fs.promises.readFile(itemPath);
                        const base64Data = fileData.toString("base64");
                        const mimeType = getMimeType(item);
                        const dataUrl = `data:${mimeType},${base64Data}`;
                        
                        imageBase64Data.push(dataUrl);
                    }
                }
            }
        } catch (err) {
            console.error(`Error reading directory ${currentDir}:`, err);
            if (err.code === "ENOENT") {
                console.error(`Directory ${currentDir} does not exist.`);
            }
        }
    }
    
    // 开始遍历
    await traverseDirectory(directory);
    
    return imageBase64Data;
}

/**
 * 获取文件的MIME类型
 * @param fileName 文件名
 * @returns MIME类型字符串
 */
function getMimeType(fileName: string): string {
    const extension = path.extname(fileName).toLowerCase();
    
    switch (extension) {
    case ".jpg":
    case ".jpeg":
        return "image/jpeg";
    case ".png":
        return "image/png";
    case ".gif":
        return "image/gif";
    default:
        return "application/octet-stream";
    }
}