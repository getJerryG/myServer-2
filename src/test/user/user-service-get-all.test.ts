import UserService from "../../models/User/services/userService";

describe("UserService Get All Users Test", () => {
    it("should get all users via UserService", async () => {
        const users = await UserService.getAllUser();
        expect(users).toBeDefined();
        expect(Array.isArray(users)).toBe(true);
    });
});
