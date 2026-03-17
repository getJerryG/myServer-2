import User from "../../models/User/data/userData";

describe("User Get All Test", () => {
    it("should get all users", async () => {
        const users = await User.getAll();
        expect(users).toBeDefined();
        expect(Array.isArray(users)).toBe(true);
    });
});
