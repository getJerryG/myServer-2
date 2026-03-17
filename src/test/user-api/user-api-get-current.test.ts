import request from "supertest";
import express from "express";
import userRoutes from "../../routes/userRoutes";

// 模拟RedisCacheManager，防止Redis调用失败
jest.mock("@/utils/redisCache", () => ({
    __esModule: true,
    default: {
        get: jest.fn().mockRejectedValue(new Error("Redis mock error")),
        set: jest.fn().mockResolvedValue(true)
    }
}));

// 模拟User类，防止数据库调用失败
jest.mock("@/models/User/data/userData", () => ({
    __esModule: true,
    default: {
        findOne: jest.fn().mockResolvedValue({
            userId: 1,
            nickname: "testUser",
            gamename: "gameUser123",
            avatar: "https://example.com/avatar.jpg",
            status: 1,
            role: 0,
            sex: 1,
            permission: [],
            exp: 0,
            signIn: {
                signInDays: 0,
                lastSignInTime: null
            }
        })
    }
}));

// 模拟UserService，确保getInfo方法返回正确的用户信息
jest.mock("@/models/User/services/userService", () => {
    // 创建一个模拟类
    class MockUserService {
        static getUser = jest.fn().mockResolvedValue({
            userId: 1,
            nickname: "testUser",
            gamename: "gameUser123",
            avatar: "https://example.com/avatar.jpg",
            status: 1,
            role: 0,
            sex: 1,
            permission: [],
            exp: 0,
            signIn: {
                signInDays: 0,
                lastSignInTime: null
            }
        });

        static getInfo = jest.fn().mockImplementation((user: any) => ({
            userId: user.userId,
            nickname: user.nickname,
            gamename: user.gamename,
            avatar: user.avatar,
            sex: user.sex,
            permission: user.permission,
            exp: user.exp,
            status: user.status,
            signIn: user.signIn
        }));
    }

    return {
        __esModule: true,
        default: MockUserService
    };
});

// 模拟认证中间件
jest.mock("../../middlewares/auth", () => {
    return (req: any, res: any, next: any) => {
        req.user = { userId: 1, role: 0 };
        next();
    };
});

// 创建测试应用
const app = express();

// 添加调试中间件
app.use((req, res, next) => {
    console.log(`Received request: ${req.method} ${req.path}`);
    next();
});

app.use(express.json());
app.use("/users", userRoutes);

describe("GET /users - 获取当前用户信息", () => {
    it("should get current user info", async () => {
        const response = await request(app)
            .get("/users")
            .set("Authorization", "Bearer test-token");
    
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("code", 200);
        expect(response.body).toHaveProperty("message", "获取用户信息成功");
        expect(response.body.data).toHaveProperty("userId", 1);
        expect(response.body.data).toHaveProperty("nickname", "testUser");
    });
});
