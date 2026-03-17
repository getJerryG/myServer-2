import request from "supertest";
import express from "express";
import userRoutes from "../../routes/userRoutes";

// 模拟UserService
jest.mock("../../models/User/services/userService", () => ({
    __esModule: true,
    default: {
        getUser: jest.fn().mockResolvedValue({
            userId: 1,
            nickname: "testUser",
            gamename: "gameUser123",
            avatar: "https://example.com/avatar.jpg",
            status: 1,
            role: 0,
            sex: 1
        }),
        getInfo: jest.fn().mockImplementation((user: any) => ({
            userId: user.userId,
            nickname: user.nickname,
            gamename: user.gamename,
            avatar: user.avatar,
            sex: user.sex
        }))
    }
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

describe("GET /users/:userId - 获取其他用户信息", () => {
    it("should get other user info by userId", async () => {
        const response = await request(app)
            .get("/users/1")
            .set("Authorization", "Bearer test-token");
    
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("code", 200);
        expect(response.body).toHaveProperty("message", "获取用户信息成功");
    });
});
