import express from "express";
import UserControlles from "@/controllers/userController";
import authMiddleware from "@/middlewares/auth";
import { Admin } from "@/middlewares/role";
;
const router = express.Router();

router.get("/", authMiddleware, UserControlles.getUser); // 获取当前用户信息

// 
router.put("/upDataInfo", authMiddleware, UserControlles.upDataUser);
// 
router.delete("/delete/:userId", authMiddleware, UserControlles.deleteUser); router.post("/signIn", authMiddleware, UserControlles.signIn);

router.get("/:userId", authMiddleware, UserControlles.getOtherUser);

router.get("/all", authMiddleware, Admin, UserControlles.getAllUser);

export default router;
