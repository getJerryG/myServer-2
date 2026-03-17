import express, { Request, Response, NextFunction, Router } from "express";
import { resSuccess, resInternalServerError } from "../utils/res";
import authMiddleware from "../middlewares/auth";

const router: Router = express.Router();

// 获取首页数据
router.get("/", authMiddleware, async (req: Request, res: Response, _next: NextFunction) => {
    try {
        const PageData = {
            user: {},
            ad: [],
            announcement: [],
            activities: [],
            broadcast: []
        };

        resSuccess(res, PageData, "获取首页数据成功");
    } catch (error) {
        resInternalServerError(res, (error as Error).message);
    }
});

export default router;