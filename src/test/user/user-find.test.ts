import User from "../../models/User/data/userData";
import UserModel from "../../models/User/models/users";
import { IUser, UserType } from "@/types/user";

describe("User Find Test", () => {
    // 测试数据
    const testUser: UserType = {
        nickname: "testUser",
        gamename: "gameUser123",
        avatar: "https://example.com/avatar.jpg",
        status: 1,
        role: 0,
        sex: 1,
        openId: "test_openid_125",
        session_key: "test_session_key"
    };

    let createdUser: IUser;

    beforeAll(async () => {
    // 创建测试用户
        createdUser = await User.create(testUser);
    });

    afterAll(async () => {
    // 删除测试创建的用户
        if (createdUser) {
            await UserModel.deleteOne({ userId: createdUser.userId });
        }
    });

    it("should find users by query", async () => {
        const users = await User.find({ nickname: testUser.nickname });
        expect(users).toBeDefined();
        expect(Array.isArray(users)).toBe(true);
        expect(users.length).toBeGreaterThan(0);
    });
});
