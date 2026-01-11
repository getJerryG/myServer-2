import { describe, it, expect } from "vitest";
import type { 
    ExtractStatuses, 
    ConditionalType, 
    IfHasProperty,
    PartialBy,
    RequiredBy,
    IsNever,
    IsAny,
    IsUnknown,
    Strict,
    Exact,
    ValidateType,
    ExtractKeysByType,
    ExtractValuesByType,
    OmitType,
    DeepPartial,
    DeepRequired,
    UnionToIntersection,
    LastOf,
    FirstOf,
    Head,
    Tail,
    Length,
    Push,
    Unshift,
    Reverse,
    Includes,
    Unique,
    Flatten,
    Join,
    Split,
    CamelCase,
    KebabCase,
    PascalCase,
    SnakeCase,
    TrimLeft,
    TrimRight,
    Trim,
    Replace,
    ReplaceAll,
    StringIncludes,
    StringStartsWith,
    StringEndsWith,
    StringLength,
    ToUpperCase,
    ToLowerCase,
    Capitalize,
    Uncapitalize
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

    describe("Strict", () => {
        it("should allow only specified properties", () => {
            type TestType = { name: string; age: number };
            type StrictType = Strict<TestType, { name: string }>;
            
            const result: StrictType = { name: "test" };
            expect(result.name).toBe("test");
            expect(result.age).toBeUndefined();
        });
    });

    describe("Exact", () => {
        it("should match exact shape", () => {
            type TestType = { name: string; age: number };
            type ExactType = Exact<TestType, { name: string; age: number }>;
            
            const result: ExactType = { name: "test", age: 25 };
            expect(result.name).toBe("test");
            expect(result.age).toBe(25);
        });
    });

    describe("ValidateType", () => {
        it("should return true when types match", () => {
            type Result = ValidateType<string, string>;
            
            const result: Result = true;
            expect(result).toBe(true);
        });

        it("should return false when types do not match", () => {
            type Result = ValidateType<string, number>;
            
            const result: Result = false;
            expect(result).toBe(false);
        });
    });

    describe("ExtractKeysByType", () => {
        it("should extract keys with specified type", () => {
            type TestType = { name: string; age: number; email: string };
            type Result = ExtractKeysByType<TestType, string>;
            
            const result: Result = "name" | "email";
            expect(result).toBe("name" | "email");
        });
    });

    describe("ExtractValuesByType", () => {
        it("should extract values with specified type", () => {
            type TestType = { name: string; age: number; email: string };
            type Result = ExtractValuesByType<TestType, string>;
            
            const result: Result = string;
            expect(result).toBe("string");
        });
    });

    describe("OmitType", () => {
        it("should omit specified properties", () => {
            type TestType = { name: string; age: number; email: string };
            type Result = OmitType<TestType, "age" | "email">;
            
            const result: Result = { name: "test" };
            expect(result.name).toBe("test");
            expect(result.age).toBeUndefined();
            expect(result.email).toBeUndefined();
        });
    });

    describe("DeepPartial", () => {
        it("should make all properties optional", () => {
            type TestType = { 
                name: string; 
                age: number; 
                address: { 
                    street: string; 
                    city: string 
                } 
            };
            type Result = DeepPartial<TestType>;
            
            const result: Result = { 
                name: "test", 
                age: undefined, 
                address: { 
                    street: undefined, 
                    city: undefined 
                } 
            };
            expect(result.name).toBe("test");
            expect(result.age).toBeUndefined();
            expect(result.address?.street).toBeUndefined();
        });
    });

    describe("DeepRequired", () => {
        it("should make all properties required", () => {
            type TestType = { 
                name: string; 
                age?: number; 
                address?: { 
                    street?: string; 
                    city?: string 
                } 
            };
            type Result = DeepRequired<TestType>;
            
            const result: Result = { 
                name: "test", 
                age: 25, 
                address: { 
                    street: "123 Main St", 
                    city: "New York" 
                } 
            };
            expect(result.name).toBe("test");
            expect(result.age).toBe(25);
            expect(result.address?.street).toBe("123 Main St");
        });
    });

    describe("UnionToIntersection", () => {
        it("should convert union to intersection", () => {
            type Result = UnionToIntersection<{ a: string } | { b: number }>;
            
            const result: Result = { a: string; b: number };
            expect(result.a).toBe("string");
            expect(result.b).toBe("number");
        });
    });

    describe("LastOf", () => {
        it("should get last element of union", () => {
            type Result = LastOf<"a" | "b" | "c">;
            
            const result: Result = "c";
            expect(result).toBe("c");
        });
    });

    describe("FirstOf", () => {
        it("should get first element of union", () => {
            type Result = FirstOf<"a" | "b" | "c">;
            
            const result: Result = "a";
            expect(result).toBe("a");
        });
    });

    describe("Head", () => {
        it("should get first element of tuple", () => {
            type Result = Head<["a", "b", "c"]>;
            
            const result: Result = "a";
            expect(result).toBe("a");
        });
    });

    describe("Tail", () => {
        it("should get tail of tuple", () => {
            type Result = Tail<["a", "b", "c"]>;
            
            const result: Result = ["b", "c"];
            expect(result).toEqual(["b", "c"]);
        });
    });

    describe("Length", () => {
        it("should get length of tuple", () => {
            type Result = Length<["a", "b", "c"]>;
            
            const result: Result = 3;
            expect(result).toBe(3);
        });
    });

    describe("Push", () => {
        it("should push element to array", () => {
            type Result = Push<["a", "b"], "c">;
            
            const result: Result = ["a", "b", "c"];
            expect(result).toEqual(["a", "b", "c"]);
        });
    });

    describe("Unshift", () => {
        it("should unshift element to array", () => {
            type Result = Unshift<["b", "c"], "a">;
            
            const result: Result = ["a", "b", "c"];
            expect(result).toEqual(["a", "b", "c"]);
        });
    });

    describe("Reverse", () => {
        it("should reverse array", () => {
            type Result = Reverse<["a", "b", "c"]>;
            
            const result: Result = ["c", "b", "a"];
            expect(result).toEqual(["c", "b", "a"]);
        });
    });

    describe("Includes", () => {
        it("should return true when element exists", () => {
            type Result = Includes<["a", "b", "c"], "b">;
            
            const result: Result = true;
            expect(result).toBe(true);
        });

        it("should return false when element does not exist", () => {
            type Result = Includes<["a", "b", "c"], "d">;
            
            const result: Result = false;
            expect(result).toBe(false);
        });
    });

    describe("Unique", () => {
        it("should remove duplicates", () => {
            type Result = Unique<["a", "b", "a", "c", "b"]>;
            
            const result: Result = ["a", "b", "c"];
            expect(result).toEqual(["a", "b", "c"]);
        });
    });

    describe("Flatten", () => {
        it("should flatten nested arrays", () => {
            type Result = Flatten<[[1, 2], [3, [4, 5]]>;
            
            const result: Result = [1, 2, 3, 4, 5];
            expect(result).toEqual([1, 2, 3, 4, 5]);
        });
    });

    describe("Join", () => {
        it("should join strings", () => {
            type Result = Join<["a", "b", "c"], "-">;
            
            const result: Result = "a-b-c";
            expect(result).toBe("a-b-c");
        });
    });

    describe("Split", () => {
        it("should split string", () => {
            type Result = Split<"a-b-c", "-">;
            
            const result: Result = ["a", "b", "c"];
            expect(result).toEqual(["a", "b", "c"]);
        });
    });

    describe("CamelCase", () => {
        it("should convert to camel case", () => {
            type Result = CamelCase<"hello-world">;
            
            const result: Result = "helloWorld";
            expect(result).toBe("helloWorld");
        });
    });

    describe("KebabCase", () => {
        it("should convert to kebab case", () => {
            type Result = KebabCase<"helloWorld">;
            
            const result: Result = "hello-world";
            expect(result).toBe("hello-world");
        });
    });

    describe("PascalCase", () => {
        it("should convert to pascal case", () => {
            type Result = PascalCase<"helloWorld">;
            
            const result: Result = "HelloWorld";
            expect(result).toBe("HelloWorld");
        });
    });

    describe("SnakeCase", () => {
        it("should convert to snake case", () => {
            type Result = SnakeCase<"helloWorld">;
            
            const result: Result = "hello_world";
            expect(result).toBe("hello_world");
        });
    });

    describe("TrimLeft", () => {
        it("should trim left spaces", () => {
            type Result = TrimLeft<"  hello", " ">;
            
            const result: Result = "hello";
            expect(result).toBe("hello");
        });
    });

    describe("TrimRight", () => {
        it("should trim right spaces", () => {
            type Result = TrimRight<"hello  ", " ">;
            
            const result: Result = "hello";
            expect(result).toBe("hello");
        });
    });

    describe("Trim", () => {
        it("should trim both sides", () => {
            type Result = Trim<"  hello  ">;
            
            const result: Result = "hello";
            expect(result).toBe("hello");
        });
    });

    describe("Replace", () => {
        it("should replace first occurrence", () => {
            type Result = Replace<"hello world", "world", "typescript">;
            
            const result: Result = "hello typescript";
            expect(result).toBe("hello typescript");
        });
    });

    describe("ReplaceAll", () => {
        it("should replace all occurrences", () => {
            type Result = ReplaceAll<"hello world world", "world", "typescript">;
            
            const result: Result = "hello typescript typescript";
            expect(result).toBe("hello typescript typescript");
        });
    });

    describe("StringIncludes", () => {
        it("should return true when string includes", () => {
            type Result = StringIncludes<"hello world", "world">;
            
            const result: Result = true;
            expect(result).toBe(true);
        });

        it("should return false when string does not include", () => {
            type Result = StringIncludes<"hello world", "typescript">;
            
            const result: Result = false;
            expect(result).toBe(false);
        });
    });

    describe("StringStartsWith", () => {
        it("should return true when string starts with", () => {
            type Result = StringStartsWith<"hello world", "hello">;
            
            const result: Result = true;
            expect(result).toBe(true);
        });

        it("should return false when string does not start with", () => {
            type Result = StringStartsWith<"hello world", "world">;
            
            const result: Result = false;
            expect(result).toBe(false);
        });
    });

    describe("StringEndsWith", () => {
        it("should return true when string ends with", () => {
            type Result = StringEndsWith<"hello world", "world">;
            
            const result: Result = true;
            expect(result).toBe(true);
        });

        it("should return false when string does not end with", () => {
            type Result = StringEndsWith<"hello world", "hello">;
            
            const result: Result = false;
            expect(result).toBe(false);
        });
    });

    describe("StringLength", () => {
        it("should return string length", () => {
            type Result = StringLength<"hello">;
            
            const result: Result = 5;
            expect(result).toBe(5);
        });
    });

    describe("ToUpperCase", () => {
        it("should convert to upper case", () => {
            type Result = ToUpperCase<"hello">;
            
            const result: Result = "HELLO";
            expect(result).toBe("HELLO");
        });
    });

    describe("ToLowerCase", () => {
        it("should convert to lower case", () => {
            type Result = ToLowerCase<"HELLO">;
            
            const result: Result = "hello";
            expect(result).toBe("hello");
        });
    });

    describe("Capitalize", () => {
        it("should capitalize first letter", () => {
            type Result = Capitalize<"hello">;
            
            const result: Result = "Hello";
            expect(result).toBe("Hello");
        });
    });

    describe("Uncapitalize", () => {
        it("should uncapitalize first letter", () => {
            type Result = Uncapitalize<"Hello">;
            
            const result: Result = "hello";
            expect(result).toBe("hello");
        });
    });
});
