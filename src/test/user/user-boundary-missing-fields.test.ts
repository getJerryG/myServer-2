import User from "../../models/User/data/userData";
import { UserType } from "@/types/user";

describe("User Boundary Test - Missing Required Fields", () => {
    it("should handle missing required fields when creating user", async () => {
        const invalidUser: UserType = {
            // 缺少必填字段
        };

        await expect(User.create(invalidUser)).rejects.toThrow();
    });
});
