import User from "../../models/User/data/userData";
import { UserType } from "@/types/user";

describe("User Boundary Test - Invalid Role", () => {
    it("should handle invalid role value", async () => {
        const invalidRoleUser: any = {
            nickname: "testUser",
            gamename: "gameUser123",
            avatar: "https://example.com/avatar.jpg",
            status: 1,
            role: 999, // 无效角色值
            sex: 1,
            openId: "invalid_role_openid",
            session_key: "test_session_key"
        };

        await expect(User.create(invalidRoleUser)).rejects.toThrow();
    });
});
