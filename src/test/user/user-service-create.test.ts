import UserService from "../../models/User/services/userService";
import UserModel from "../../models/User/models/users";
import { UserType } from "@/types/user";

describe("UserService Create Test", () => {
    // 测试数据
    const testUser: UserType = {
        nickname: "serviceUser",
        gamename: "serviceGameUser",
        avatar: "https://example.com/service-avatar.jpg",
        status: 1,
        role: 0,
        sex: 0,
        openId: "service_openid_456",
        session_key: "service_session_key"
    };

    it("should create user via UserService", async () => {
        const user = await UserService.createUser(testUser);
        expect(user).toBeDefined();
        expect(user.nickname).toBe(testUser.nickname);
        expect(user.gamename).toBe(testUser.gamename);

        // 清理测试数据
        await UserModel.deleteOne({ userId: user.userId });
    });
});
