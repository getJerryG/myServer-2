import User from "../../models/User/data/userData";
import UserModel from "../../models/User/models/users";
import { IUser, UserType } from "@/types/user";

describe("User Create Test", () => {
    // 测试数据
    const testUser: UserType = {
        nickname: "testUser",
        gamename: "gameUser123",
        avatar: "https://example.com/avatar.jpg",
        status: 1,
        role: 0,
        sex: 1,
        openId: "test_openid_123",
        session_key: "test_session_key"
    };

    let createdUser: IUser;

    afterAll(async () => {
    // 删除测试创建的用户
        if (createdUser) {
            await UserModel.deleteOne({ userId: createdUser.userId });
        }
    });

    it("should create a new user", async () => {
        const user = await User.create(testUser);
        expect(user).toBeDefined();
        expect(user.nickname).toBe(testUser.nickname);
        expect(user.gamename).toBe(testUser.gamename);
        expect(user.avatar).toBe(testUser.avatar);
        expect(user.status).toBe(testUser.status);
        expect(user.role).toBe(testUser.role);
        expect(user.sex).toBe(testUser.sex);
        expect(user.openId).toBe(testUser.openId);
        expect(user.session_key).toBe(testUser.session_key);
    
        createdUser = user;
    });
});
