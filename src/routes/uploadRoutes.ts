import express, { Request, Response } from "express";
import { resSuccess, resError, resBadRequest, resNotFound } from "../utils/res";
import fs from "fs";
import path from "path";
import upload from "@/middlewares/upload";
import authMiddleware from "@/middlewares/auth";
import UserService from "@/models/User/services/userService";
import RedisCacheManager from "@/utils/redisCache"; //  RedisCache 
import sharp from "sharp";

const router = express.Router();

router.post("/uploadAvatar", authMiddleware, upload.single("file"), async (req: Request, res: Response) => {
    try {
        const { userId } = req.user;
        if (!userId) {
            return resBadRequest(res, "用户ID不存在");
        }

        const user = await UserService.getUser(userId);
        if (!user) {
            return resNotFound(res, "用户不存在");
        }

        if (!req.file) {
            return resBadRequest(res, "未上传文件");
        }

        const targetFolder = path.join("public", "images", "userAvatars");

        // 确保目标文件夹存在
        await fs.promises.mkdir(targetFolder, { recursive: true });

        // 生成新的文件名
        const fileName = `${crypto.randomUUID().slice(0, 6)}-${userId}`;
        const fullTargetPath = path.join(targetFolder, `${fileName}.webp`);

        // 处理旧头像文件
        if (user.avatar) {
            const oldAvatarPath = path.join(targetFolder, user.avatar.replace("userAvatars/", ""));
            try {
                await fs.promises.unlink(oldAvatarPath);
            } catch (error) {
                console.error("删除旧头像失败:", error);
            }
        }

        // 处理并保存新头像
        await sharp(req.file.path)
            .resize(100, 100)
            .webp({ quality: 80 })
            .toFile(fullTargetPath);

        // 删除临时文件
        await fs.promises.unlink(req.file.path);

        // 更新用户头像
        const newAvatarPath = `userAvatars/${fileName}.webp`;
        user.avatar = newAvatarPath;
        await user.save();

        // 更新缓存
        const cacheKey = `user:avatar:${userId}`;
        const userCache = await RedisCacheManager.get(cacheKey);
        if (userCache) {
            const updatedCache = { ...userCache as Record<string, unknown>, avatar: newAvatarPath };
            await RedisCacheManager.set(cacheKey, updatedCache, 60 * 3);
        }

        resSuccess(res, { code: 200, avatar: newAvatarPath }, "头像上传成功");
    } catch (error) {
        console.error("上传头像失败:", error);
        resError(res, 500, "头像上传失败");
    }
});

export default router;