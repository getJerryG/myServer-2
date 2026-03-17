import UserService from "./userService";
import { IUser } from "@/types/user"; // 使用正确的路径别名

// 模拟RedisCacheManager
jest.mock("@/utils/redisCache", () => {
    return {
        __esModule: true,
        default: {
            get: jest.fn().mockReturnValue(Promise.resolve(null)), // 模拟缓存未命中
            set: jest.fn().mockReturnValue(Promise.resolve(true)) // 返回Promise
        }
    };
});

// 直接模拟User模块的方法
jest.mock("../data/userData", () => {
    const mockUser = {
        userId: 1,
        _id: "test_id", // 添加_id属性
        nickname: "testUser",
        gamename: "gameUser123",
        avatar: "https://example.com/avatar.jpg",
        status: 1,
        role: 0,
        sex: 1,
        openId: "test_openid_123",
        session_key: "test_session_key",
        permission: 0,
        exp: 0,
        signIn: {
            signInDays: 0,
            lastSignInTime: null
        }
    };
  
    return {
        __esModule: true,
        default: {
            create: jest.fn().mockResolvedValue(mockUser),
            getSession_key: jest.fn().mockResolvedValue({
                userId: 1,
                _id: "test_id",
                session_key: "test_session_key"
            }),
            find: jest.fn().mockResolvedValue([mockUser]),
            findOne: jest.fn().mockResolvedValue(mockUser),
            findOneAndUpdate: jest.fn().mockResolvedValue(mockUser),
            getAll: jest.fn().mockResolvedValue([mockUser]),
            deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 })
        }
    };
});

// 测试数据
const testUser = {
    nickname: "testUser",
    gamename: "gameUser123",
    avatar: "https://example.com/avatar.jpg",
    status: 1,
    role: 0,
    sex: 1,
    openId: "test_openid_123",
    session_key: "test_session_key"
};

describe("UserService Unit Tests", () => {

    describe("createUser", () => {
        it("should create a new user", async () => {
            const user = await UserService.createUser(testUser);
            expect(user).toBeDefined();
            expect(user.nickname).toBe(testUser.nickname);
            expect(user.gamename).toBe(testUser.gamename);
            expect(user.avatar).toBe(testUser.avatar);
            expect(user.status).toBe(testUser.status);
            expect(user.role).toBe(testUser.role);
            expect(user.sex).toBe(testUser.sex);
            expect(user.openId).toBe(testUser.openId);
            expect(user.session_key).toBe(testUser.session_key);
        });
    });

    describe("get_Id", () => {
        it("should get user _id by userId", async () => {
            const user_id = await UserService.get_Id(1);
            expect(user_id).toBeDefined();
            expect(user_id).toBe("test_id");
        });
    });

    describe("getUserId", () => {
        it("should get userId by openId", async () => {
            const userId = await UserService.getUserId("test_openid_123");
            expect(userId).toBeDefined();
            expect(userId).toBe(1);
        });
    });

    describe("getSession_key", () => {
        it("should get user session_key", async () => {
            const sessionData = await UserService.getSession_key(1);
            expect(sessionData).toBeDefined();
            expect(sessionData?.userId).toBe(1);
            expect(sessionData?.session_key).toBe("test_session_key");
        });
    });

    describe("getAllUser", () => {
        it("should get all users", async () => {
            const users = await UserService.getAllUser();
            expect(users).toBeDefined();
            expect(Array.isArray(users)).toBe(true);
            expect(users.length).toBeGreaterThan(0);
        });
    });

    describe("updateUser", () => {
        it("should update user info", async () => {
            const updateData = { nickname: "updatedUser" };
            const updatedUser = await UserService.updateUser(1, updateData);
            expect(updatedUser).toBeDefined();
        });
    });

    describe("deleteUser", () => {
        it("should delete user", async () => {
            const result = await UserService.deleteUser(1);
            expect(result).toBeDefined();
        });
    });

    describe("getUser", () => {
        it("should get user by userId", async () => {
            const user = await UserService.getUser(1);
            expect(user).toBeDefined();
            expect(user?.userId).toBe(1);
        });
    });

    describe("getInfo", () => {
        it("should get user basic info", () => {
            const user = {
                userId: 1,
                nickname: "testUser",
                avatar: "https://example.com/avatar.jpg",
                sex: 1,
                role: 0,
                permission: 0,
                exp: 0,
                status: 1,
                signIn: {
                    signInDays: 0,
                    lastSignInTime: null
                }
            };
      
            const info = UserService.getInfo(user as IUser);
            expect(info).toBeDefined();
            expect(info).toHaveProperty("userId", 1);
            expect(info).toHaveProperty("nickname", "testUser");
            expect(info).toHaveProperty("avatar", "https://example.com/avatar.jpg");
            expect(info).toHaveProperty("sex", 1);
            expect(info).toHaveProperty("role", 0);
            expect(info).toHaveProperty("permission", 0);
            expect(info).toHaveProperty("exp", 0);
            expect(info).toHaveProperty("status", 1);
            expect(info).toHaveProperty("signIn");
        });
    });
});
