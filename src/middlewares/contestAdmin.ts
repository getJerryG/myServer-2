import { Request, Response, NextFunction } from "express";
import { resError, resForbidden } from "@/utils/res";
import { ContestService } from "@/models/contest";

export interface ContestAdminCheckOptions {
    requirePermission?: "view" | "edit" | "submitData" | "manageAdmins";
}

function extractContestId(req: Request): { contestId: number | null; error: string | null } {
    const idParam = req.params.id || req.query.id;
    if (!idParam) {
        return { contestId: null, error: "缺少竞赛ID" };
    }

    const contestId = Number(idParam);
    if (isNaN(contestId)) {
        return { contestId: null, error: "无效的竞赛ID" };
    }

    return { contestId, error: null };
}

function extractUserId(req: Request): { userId: string | null; error: string | null } {
    const userId = req.user?.userId?.toString();
    if (!userId) {
        return { userId: null, error: "用户未登录" };
    }

    return { userId, error: null };
}

export function contestAdminPermission(options: ContestAdminCheckOptions = {}) {
    const { requirePermission = "submitData" } = options;

    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { contestId, error: contestIdError } = extractContestId(req);
            if (contestIdError) {
                return resError(res, 400, contestIdError);
            }

            const contest = await ContestService.getContestById(contestId!);
            if (!contest) {
                return resError(res, 404, "竞赛不存在");
            }

            const { userId, error: userIdError } = extractUserId(req);
            if (userIdError) {
                return resError(res, 401, userIdError);
            }

            const isAdmin = contest.isAdmin(userId!);
            if (!isAdmin) {
                return resForbidden(res, "您不是该竞赛的管理员，无权执行此操作");
            }

            if (requirePermission) {
                const hasPermission = contest.hasPermission(userId!, requirePermission);
                if (!hasPermission) {
                    return resForbidden(res, `您没有${requirePermission}权限`);
                }
            }

            req.contest = contest;
            next();
        } catch (error) {
            console.error("赛事管理员权限检查失败:", error);
            resError(res, 500, "权限检查失败");
        }
    };
}

export default contestAdminPermission;
