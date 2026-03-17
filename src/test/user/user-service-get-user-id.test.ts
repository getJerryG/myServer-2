import UserService from "../../models/User/services/userService";
import User from "../../models/User/data/userData";
import UserModel from "../../models/User/models/users";
import { IUser, UserType } from "@/types/user";

describe("UserService Get UserId Test", () => {
    // 测试数据
    const testUser: UserType = {
        nickname: "testUser",
        gamename: "gameUser123",
        avatar: "https://example.com/avatar.jpg",
        status: 1,
        role: 0,
        sex: 1,
        openId: "test_openid_129",
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

    it("should get userId by openId", async () => {
        const userId = await UserService.getUserId(testUser.openId);
        expect(userId).toBeDefined();
        expect(userId).toBe(createdUser.userId);
    });
});
