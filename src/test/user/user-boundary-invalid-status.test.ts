import User from "../../models/User/data/userData";
import { UserType } from "@/types/user";

describe("User Boundary Test - Invalid Status", () => {
    it("should handle invalid status value", async () => {
        const invalidStatusUser: any = {
            nickname: "testUser",
            gamename: "gameUser123",
            avatar: "https://example.com/avatar.jpg",
            status: 999, // 无效状态值
            role: 0,
            sex: 1,
            openId: "invalid_status_openid",
            session_key: "test_session_key"
        };

        await expect(User.create(invalidStatusUser)).rejects.toThrow();
    });
});
