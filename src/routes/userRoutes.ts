import express from "express";
import UserController from "@/controllers/userController";
import authMiddleware from "@/middlewares/auth";
import { Admin } from "@/middlewares/role";
const router = express.Router();

router.get("/", authMiddleware, UserController.getUser); // 获取当前用户信息

// 
router.put("/upDataInfo", authMiddleware, UserController.upDataUser);
// 
router.delete("/delete/:userId", authMiddleware, UserController.deleteUser);
router.post("/signIn", authMiddleware, UserController.signIn);

router.get("/:userId", authMiddleware, UserController.getOtherUser);

router.get("/all", authMiddleware, Admin, UserController.getAllUser);

export default router;
