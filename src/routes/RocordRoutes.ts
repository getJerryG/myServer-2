/**
 * 游戏记录路由
 */
import express from "express";
import { resSuccess, resError, resNotFound, resBadRequest } from "../utils/res";
import { GameRecord } from "@/models/contest/record";


const router = express.Router();

/**
 * 根据ID获取游戏记录
 */
router.get("/", (req, res) => {
    try {
        const id = req.query.id as string;
        if (!id) {
            return resBadRequest(res, "缺少ID参数");
        }
        
        const gameRecord = new GameRecord([]);
        const recordData = gameRecord.records[id];
        if (!recordData) {
            return resNotFound(res, "记录不存在");
        }
        
        resSuccess(res, recordData, "获取记录成功");
    } catch (error) {
        resError(res, 500, error instanceof Error ? error.message : "获取记录失败");
    }
});

/**
 * 分页获取游戏记录
 */
router.get("/page", (req, res) => {
    try {
        const num = Number(req.query.num) || 10;
        const page = Number(req.query.page) || -1;
        
        const gameRecord = new GameRecord([]);
        // const records = gameRecord.getRecords(num, page);
        const records = [];
        resSuccess(res, records, "获取记录成功");
    } catch (error) {
        resError(res, 500, error instanceof Error ? error.message : "获取记录失败");
    }
});

/**
 * 按时间获取游戏记录
 */
router.get("/time", (req, res) => {
    try {
        const start = req.query.start as string;
        const end = req.query.end as string;
        
        if (!start || !end) {
            return resBadRequest(res, "缺少时间参数");
        }
        
        const gameRecord = new GameRecord([]);
        // const records = gameRecord.getRecordsByTime(start, end);
        resSuccess(res, [], "功能暂未实现");
    } catch (error) {
        resError(res, 500, error instanceof Error ? error.message : "获取记录失败");
    }
});

export default router;