import UserService from "./userService";
import { IUser } from "@/types/user"; // 使用正确的路径别名

describe("UserService Simple Unit Tests", () => {
    describe("getInfo - complete data", () => {
        it("should get user basic info with complete data", () => {
            const user: IUser = {
                userId: 1,
                username: "testUsername",
                nickname: "testUser",
                avatar: "https://example.com/avatar.jpg",
                role: 0,
                sex: 1,
                permission: 100,
                exp: 1000,
                status: 1,
                lastLoginTime: new Date("2023-01-01"),
                signIn: {
                    signInDays: 5,
                    lastSignInTime: new Date("2023-01-05")
                },
                gamename: "gameUser123",
                openId: "test_openid_123",
                session_key: "test_session_key",
                user_title: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                roleIds: [],
                _id: "test_id"
            };
      
            const info = UserService.getInfo(user);
      
            expect(info).toBeDefined();
            expect(info.userId).toBe(1);
            expect(info.username).toBe("testUsername");
            expect(info.nickname).toBe("testUser");
            expect(info.avatar).toBe("https://example.com/avatar.jpg");
            expect(info.role).toBe(0);
            expect(info.sex).toBe(1);
            expect(info.permission).toBe(100);
            expect(info.exp).toBe(1000);
            expect(info.status).toBe(1);
            expect(info.lastLoginTime).toEqual(new Date("2023-01-01"));
            expect(info.signIn).toBeDefined();
            expect(info.signIn.signInDays).toBe(5);
            expect(info.signIn.lastSignInTime).toEqual(new Date("2023-01-05"));
        });
    });
    
    describe("getInfo - missing optional fields", () => {
        it("should handle missing optional fields", () => {
            const user: Partial<IUser> = {
                userId: 1,
                nickname: "testUser",
                avatar: "https://example.com/avatar.jpg",
                role: 0,
                sex: 1,
                _id: "test_id"
            };
      
            const info = UserService.getInfo(user as IUser);
      
            expect(info).toBeDefined();
            expect(info.userId).toBe(1);
            expect(info.username).toBe("");
            expect(info.nickname).toBe("testUser");
            expect(info.avatar).toBe("https://example.com/avatar.jpg");
            expect(info.role).toBe(0);
            expect(info.sex).toBe(1);
            expect(info.permission).toBeUndefined();
            expect(info.exp).toBeUndefined();
            expect(info.status).toBeUndefined();
            expect(info.lastLoginTime).toBeNull();
            expect(info.signIn).toBeDefined();
            expect(info.signIn.signInDays).toBe(0);
            expect(info.signIn.lastSignInTime).toBeNull();
        });
    });
    
    describe("getInfo - undefined properties", () => {
        it("should handle undefined user properties", () => {
            const user: Partial<IUser> = {
                userId: 1,
                _id: "test_id"
            };
      
            const info = UserService.getInfo(user as IUser);
      
            expect(info).toBeDefined();
            expect(info.userId).toBe(1);
            expect(info.username).toBe("");
            expect(info.nickname).toBeUndefined();
            expect(info.avatar).toBeUndefined();
            expect(info.role).toBeUndefined();
            expect(info.sex).toBeUndefined();
            expect(info.permission).toBeUndefined();
            expect(info.exp).toBeUndefined();
            expect(info.status).toBeUndefined();
            expect(info.lastLoginTime).toBeNull();
            expect(info.signIn).toBeDefined();
            expect(info.signIn.signInDays).toBe(0);
            expect(info.signIn.lastSignInTime).toBeNull();
        });
    });
});
