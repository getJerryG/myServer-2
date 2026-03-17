import { Document } from "mongoose";

export type Status = "active" | "inactive" | "expired" | "revoked" | "pending" | "granted";

export type EntityStatus = {
    user: 0 | 1 | 2 | 3;
    wallet: 0 | 1;
    transaction: 0 | 1 | 2;
    contest: 0 | 1 | 2 | 3 | 4 | 5;
};

export interface Timestamps {
    createdAt: Date;
    updatedAt: Date;
}

export interface OptionalTimestamps {
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Metadata {
    [key: string]: unknown;
}

export type WithMetadata<T> = T & { metadata?: Metadata };

export type EntityId = string | number;

export interface WithId {
    id: EntityId;
}

export type WithId<T> = T & WithId;

export type WithDocument<T> = T & Document;

export type BaseEntity<T extends Timestamps> = T & Timestamps;

export type OptionalEntity<T extends Timestamps> = T & OptionalTimestamps;
