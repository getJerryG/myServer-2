import express, { Request, Response, Router } from "express";
import userRoutes from "./contest/userRoutes";
import adminRoutes from "./contest/adminRoutes";
import superAdminRoutes from "./contest/superAdminRoutes";
import permissionRoutes from "./contest/permissionRoutes";
import { resNotFound } from "../utils/res";

const router: Router = express.Router();

/**
 * @module 
 * @description 
 * @author 
 * @date 2025-12-18
 */

/**
 * 
 *
 * 
 * 1.  (userRoutes) - 
 * 2.  (adminRoutes) - 
 * 3.  (superAdminRoutes) - 
 *
 * 
 * RESTful APIHTTP
 * 
 */

/**
 * 
 *
 * 
 * 
 */

//  - 
router.use("/", userRoutes);
//  - 
router.use("/", adminRoutes);
//  - 
router.use("/", superAdminRoutes);
// 权限管理路由
router.use("/permission", permissionRoutes);

/**
 * 404
 *
 * 
 */
router.use("*", (_req: Request, res: Response) => {
    resNotFound(res, "请求的资源不存在");
});

export default router;