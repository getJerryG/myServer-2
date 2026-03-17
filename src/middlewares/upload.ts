import multer from "multer";
import { Request } from "express";

const storage = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb) {
        // 设置文件存储目录
        cb(null, "uploads/");
    },
    filename: function (req: Request, file: Express.Multer.File, cb) {
        // 设置文件名
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: function (req: Request, file: Express.Multer.File, cb) {
        // 设置文件过滤规则
        cb(null, true);
    }
});

export default upload;