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
        updateUser: jest.fn().mockResolvedValue({
            userId: 1,
            nickname: "updatedUser",
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

describe("PUT /users/upDataInfo - 更新用户信息", () => {
    it("should update user info", async () => {
        const response = await request(app)
            .put("/users/upDataInfo")
            .set("Authorization", "Bearer test-token")
            .send({
                nickname: "updatedUser",
                avatar: "https://example.com/new-avatar.jpg"
            });
    
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("code", 200);
        expect(response.body).toHaveProperty("message", "更新用户信息成功");
    });
});
