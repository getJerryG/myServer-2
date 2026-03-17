import { describe, it, expect } from "@jest/globals";
import type { 
    ExtractStatuses, 
    ConditionalType, 
    IfHasProperty,
    PartialBy,
    RequiredBy,
    IsNever,
    IsAny,
    IsUnknown
} from "../type-utils";

describe("Type Utils", () => {
    describe("ConditionalType", () => {
        it("should return TrueType when condition is true", () => {
            type Result = ConditionalType<string, string, "yes", "no">;
            
            const result: Result = "yes";
            expect(result).toBe("yes");
        });

        it("should return FalseType when condition is false", () => {
            type Result = ConditionalType<number, string, "yes", "no">;
            
            const result: Result = "no";
            expect(result).toBe("no");
        });
    });

    describe("IfHasProperty", () => {
        it("should return true when property exists", () => {
            type HasName = IfHasProperty<{ name: string }, "name">;
            
            const hasName: HasName = true;
            expect(hasName).toBe(true);
        });

        it("should return false when property does not exist", () => {
            type HasAge = IfHasProperty<{ name: string }, "age">;
            
            const hasAge: HasAge = false;
            expect(hasAge).toBe(false);
        });
    });

    describe("ExtractStatuses", () => {
        it("should extract status from base type", () => {
            type TestType = { status: "active" | "inactive" };
            type Status = ExtractStatuses<TestType>;
            
            const status: Status = "active";
            expect(status).toBe("active");
        });
    });

    describe("PartialBy", () => {
        it("should make specified properties partial", () => {
            type TestType = { name: string; age: number; email: string };
            type Result = PartialBy<TestType, "age" | "email">;
            
            const result: Result = { name: "test" };
            expect(result.name).toBe("test");
            expect(result.age).toBeUndefined();
            expect(result.email).toBeUndefined();
        });
    });

    describe("RequiredBy", () => {
        it("should make specified properties required", () => {
            type TestType = { name: string; age?: number; email?: string };
            type Result = RequiredBy<TestType, "age" | "email">;
            
            const result: Result = { name: "test", age: 25, email: "test@example.com" };
            expect(result.age).toBe(25);
            expect(result.email).toBe("test@example.com");
        });
    });

    describe("IsNever", () => {
        it("should return true for never type", () => {
            type Result = IsNever<never>;
            
            const result: Result = true;
            expect(result).toBe(true);
        });

        it("should return false for non-never type", () => {
            type Result = IsNever<string>;
            
            const result: Result = false;
            expect(result).toBe(false);
        });
    });

    describe("IsAny", () => {
        it("should return true for any type", () => {
            type Result = IsAny<any>;
            
            const result: Result = true;
            expect(result).toBe(true);
        });

        it("should return false for non-any type", () => {
            type Result = IsAny<string>;
            
            const result: Result = false;
            expect(result).toBe(false);
        });
    });

    describe("IsUnknown", () => {
        it("should return true for unknown type", () => {
            type Result = IsUnknown<unknown>;
            
            const result: Result = true;
            expect(result).toBe(true);
        });

        it("should return false for non-unknown type", () => {
            type Result = IsUnknown<string>;
            
            const result: Result = false;
            expect(result).toBe(false);
        });
    });
});
