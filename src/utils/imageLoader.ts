/**
 * 图片加载器工具
 */

import fs from "fs";
import path from "path";

// 图片缓存
const imageCache: Record<string, string> = {};

/**
 * 查找图片
 * @param imagePath 图片路径
 * @returns 图片URL
 */
export async function findImage(imagePath: string): Promise<string> {
    try {
        // 检查缓存中是否已有该图片
        if (imageCache[imagePath]) {
            return imageCache[imagePath];
        }
        
        // 构建完整的图片路径
        const publicPath = path.join(__dirname, "../public");
        const fullPath = path.join(publicPath, imagePath);
        
        // 检查图片文件是否存在
        if (fs.existsSync(fullPath)) {
            // 返回图片的相对路径
            const relativePath = `/public${imagePath}`;
            imageCache[imagePath] = relativePath;
            return relativePath;
        } else {
            console.error("Image not found:", fullPath);
            return "";
        }
    } catch (err) {
        console.error("Error finding image:", imagePath, err);
        return "";
    }
}

/**
 * 预加载图片
 * @param paths 图片路径数组
 */
export async function preloadImages(paths: string[]): Promise<void> {
    try {
        const promises = paths.map(path => findImage(path));
        await Promise.all(promises);
    } catch (err) {
        console.error("Error preloading images:", err);
    }
}
