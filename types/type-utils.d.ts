export type StatusFromBase<T extends string> = T extends `${infer _Status}` 
    ? T 
    : never;

export type ExtractStatuses<T> = T extends { status: infer S } 
    ? S 
    : never;

export type ConditionalType<T, Condition, TrueType, FalseType> = 
    T extends Condition 
        ? TrueType 
        : FalseType;

export type IfHasProperty<T, K extends PropertyKey> = 
    K extends keyof T 
        ? true 
        : false;

export type PartialBy<T, K extends keyof T> = 
    Pick<T, Exclude<keyof T, K>> & Partial<Pick<T, K>>;

export type RequiredBy<T, K extends keyof T> = 
    Pick<T, Exclude<keyof T, K>> & Required<Pick<T, K>>;

export type IsNever<T> = [T] extends [never] ? true : false;

export type IsAny<T> = 0 extends (1 & T) ? true : false;

export type IsUnknown<T> = IsNever<T> extends false 
    ? IsAny<T> extends false 
        ? true 
        : false 
    : false;

export type Strict<T, U> = T & { [K in keyof T]: K extends keyof U ? T[K] : never };

export type Exact<T, Shape> = Strict<T, Shape> & Record<Exclude<keyof T, keyof Shape>, never>;

export type ValidateType<T, Expected> = 
    T extends Expected 
        ? Expected extends T 
            ? true 
            : false 
        : false;

export type ExtractKeysByType<T, V> = {
    [K in keyof T]: T[K] extends V ? K : never
}[keyof T];

export type ExtractValuesByType<T, V> = T[keyof ExtractKeysByType<T, V>];

export type OmitType<T, K extends keyof T> = {
    [P in keyof T as P extends K ? never : P]: T[P]
};

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object 
        ? DeepPartial<T[P]> 
        : T[P];
};

export type DeepRequired<T> = {
    [P in keyof T]-?: T[P] extends object 
        ? DeepRequired<T[P]> 
        : T[P];
};

export type UnionToIntersection<U> = (U extends any 
    ? (k: U) => void 
    : never) extends (k: infer I) => void 
        ? I 
        : never;

export type LastOf<T> = UnionToIntersection<T & {}> extends infer U 
    ? U extends { [infer L, ...infer R] } 
        ? LastOf<R> 
        : U 
    : never;

export type FirstOf<T> = T extends [infer F, ...infer _] 
    ? F 
    : never;

export type Head<T> = T extends [infer H, ...infer _] 
    ? H 
    : never;

export type Tail<T> = T extends [infer _, ...infer T] 
    ? T 
    : never;

export type Length<T> = T extends { length: infer L } 
    ? L 
    : never;

export type Push<T extends unknown[], U> = [...T, U];

export type Unshift<T extends unknown[], U> = [U, ...T];

export type Reverse<T extends unknown[]> = T extends [infer First, ...infer Rest] 
    ? [...Reverse<Rest>, First] 
    : [];

export type Includes<T extends unknown[], U> = U extends T[number] 
    ? true 
    : false;

export type Unique<T extends unknown[], Acc extends unknown[] = []> = T extends [infer First, ...infer Rest] 
    ? Includes<Acc, First> extends true 
        ? Unique<Rest, Acc> 
        : Unique<Rest, [...Acc, First]> 
    : Acc;

export type Flatten<T extends unknown[]> = T extends [infer First, ...infer Rest] 
    ? First extends unknown[] 
            ? [...Flatten<First>, ...Flatten<Rest>] 
            : [First, ...Flatten<Rest>] 
    : [];

export type Join<T extends string[], D extends string = ""> = T extends [infer First extends string, ...infer Rest extends string[]] 
    ? Rest extends [] 
        ? First 
        : `${First}${D}${Join<Rest, D>}` 
    : "";

export type Split<S extends string, D extends string> = S extends `${infer Before}${D}${infer After}` 
    ? [Before, ...Split<After, D>] 
    : [S];

export type CamelCase<S extends string> = S extends `${infer First}_${infer Rest}` 
    ? `${First}${Capitalize<CamelCase<Rest>>}` 
    : S;

export type KebabCase<S extends string> = S extends `${infer First}${infer Rest}` 
    ? First extends Uppercase<First> 
            ? `-${Lowercase<First>}${KebabCase<Rest>}` 
            : `${First}${KebabCase<Rest>}` 
    : S;

export type PascalCase<S extends string> = Capitalize<CamelCase<S>>;

export type SnakeCase<S extends string> = S extends `${infer First}${infer Rest}` 
    ? First extends Uppercase<First> 
            ? `_${Lowercase<First>}${SnakeCase<Rest>}` 
            : `${First}${SnakeCase<Rest>}` 
    : S;

export type TrimLeft<S extends string, C extends string = " "> = S extends `${C}${infer Rest}` 
    ? TrimLeft<Rest, C> 
    : S;

export type TrimRight<S extends string, C extends string = " "> = S extends `${infer Rest}${C}` 
    ? TrimRight<Rest, C> 
    : S;

export type Trim<S extends string> = TrimRight<TrimLeft<S>>;

export type Replace<S extends string, From extends string, To extends string> = From extends "" 
    ? S 
    : S extends `${infer Before}${From}${infer After}` 
        ? `${Before}${To}${Replace<After, From, To>}` 
        : S;

export type ReplaceAll<S extends string, From extends string, To extends string> = From extends "" 
    ? S 
    : S extends `${infer Before}${From}${infer After}` 
        ? `${Before}${To}${ReplaceAll<After, From, To>}` 
        : S;

export type StringIncludes<S extends string, Search extends string> = S extends `${infer _}${Search}${infer _}` 
    ? true 
    : false;

export type StringStartsWith<S extends string, Prefix extends string> = S extends `${Prefix}${infer _}` 
    ? true 
    : false;

export type StringEndsWith<S extends string, Suffix extends string> = S extends `${infer _}${Suffix}` 
    ? true 
    : false;

export type StringLength<S extends string> = S extends `${infer _}${infer Rest}` 
    ? Rest extends "" 
        ? 1 
        : StringLength<Rest> + 1 
    : 0;

export type ToUpperCase<S extends string> = Uppercase<S>;

export type ToLowerCase<S extends string> = Lowercase<S>;

export type Capitalize<S extends string> = S extends `${infer First}${infer Rest}` 
    ? `${Uppercase<First>}${Rest}` 
    : S;

export type Uncapitalize<S extends string> = S extends `${infer First}${infer Rest}` 
    ? `${Lowercase<First>}${Rest}` 
    : S;
