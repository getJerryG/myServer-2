import request from "supertest";
import express from "express";
import userRoutes from "../../routes/userRoutes";

// 模拟UserService
jest.mock("../../models/User/services/userService", () => ({
    __esModule: true,
    default: {
        deleteUser: jest.fn().mockResolvedValue(true),
    },
}));

// 模拟认证中间件
jest.mock("../../middlewares/auth", () => {
    return (req: any, res: any, next: any) => {
        req.user = { userId: 1, role: 0 };
        next();
    };
});

// 创建测试应用
const app = express();
app.use(express.json());
app.use("/users", userRoutes);

describe("DELETE /users/delete/:userId - 删除用户", () => {
    it("should delete user successfully", async () => {
        const response = await request(app)
            .delete("/users/delete/1")
            .set("Authorization", "Bearer test-token");

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("code", 200);
        expect(response.body).toHaveProperty("message", "删除成功");
    });
});
