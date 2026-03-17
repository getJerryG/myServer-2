import User from "../../models/User/data/userData";

describe("User Boundary Test - Non-existent User", () => {
    it("should handle finding non-existent user", async () => {
        const user = await User.findOne({ userId: 999999 });
        expect(user).toBeNull();
    });
});
