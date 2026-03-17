import redis from "@/config/redis";
import { ObjectId } from "mongoose";
import { CACHE_KEYS, CACHE_TTL } from "../constants/permissionConstants";
import { UserPermissionCache, PermissionString, IPermission } from "../types/permission-types";
import UserRoleService from "./UserRoleService";

export default class PermissionCacheService {
    private static getRandomTTL(ttl: number): number {
        const randomOffset = Math.floor(Math.random() * 600);
        return ttl + randomOffset;
    }

    static async setUserPermissions(userId: string, permissions: PermissionString[], roles: string[]): Promise<void> {
        const cacheData: UserPermissionCache = {
            userId: new ObjectId(userId),
            permissions,
            roles,
            permissionsUpdatedAt: new Date()
        };

        const ttl = this.getRandomTTL(CACHE_TTL.PERMISSIONS);
        await redis.setex(CACHE_KEYS.USER_PERMISSIONS(userId), ttl, JSON.stringify(cacheData));
    }

    static async getUserPermissions(userId: string): Promise<UserPermissionCache | null> {
        const cached = await redis.get(CACHE_KEYS.USER_PERMISSIONS(userId));
        if (!cached) {
            return null;
        }
        return JSON.parse(cached) as UserPermissionCache;
    }

    static async deleteUserPermissions(userId: string): Promise<void> {
        await redis.del(CACHE_KEYS.USER_PERMISSIONS(userId));
    }

    static async setTokenMapping(userId: string, token: string): Promise<void> {
        const ttl = this.getRandomTTL(CACHE_TTL.TOKEN);
        await redis.setex(CACHE_KEYS.TOKEN_MAPPING(userId), ttl, token);
    }

    static async getTokenMapping(userId: string): Promise<string | null> {
        return await redis.get(CACHE_KEYS.TOKEN_MAPPING(userId));
    }

    static async deleteTokenMapping(userId: string): Promise<void> {
        await redis.del(CACHE_KEYS.TOKEN_MAPPING(userId));
    }

    static async setPermissionDefinitions(definitions: Record<string, IPermission>): Promise<void> {
        await redis.setex(CACHE_KEYS.PERMISSION_DEFINITIONS(), CACHE_TTL.DEFINITIONS, JSON.stringify(definitions));
    }

    static async getPermissionDefinitions(): Promise<Record<string, IPermission> | null> {
        const cached = await redis.get(CACHE_KEYS.PERMISSION_DEFINITIONS());
        if (!cached) {
            return null;
        }
        return JSON.parse(cached) as Record<string, IPermission>;
    }

    static async invalidateUserCache(userId: string): Promise<void> {
        await this.deleteUserPermissions(userId);
        await this.deleteTokenMapping(userId);
    }

    static async warmupUserPermissions(userId: string): Promise<UserPermissionCache> {
        const cached = await this.getUserPermissions(userId);
        if (cached) {
            return cached;
        }

        const permissions = await UserRoleService.getUserPermissions(userId);
        const roles = await UserRoleService.getUserRoleCodes(userId);

        await this.setUserPermissions(userId, permissions, roles);
        return {
            userId: new ObjectId(userId),
            permissions,
            roles,
            permissionsUpdatedAt: new Date()
        };
    }

    static async batchWarmupUserPermissions(userIds: string[]): Promise<void> {
        for (const userId of userIds) {
            try {
                await this.warmupUserPermissions(userId);
            } catch (error) {
                console.error(`[PermissionCacheService] 预热用户 ${userId} 权限失败:`, error);
            }
        }
    }

    static async refreshUserPermissions(userId: string): Promise<UserPermissionCache> {
        await this.invalidateUserCache(userId);
        return await this.warmupUserPermissions(userId);
    }

    static async checkCacheHealth(): Promise<{ hitRate: number; missCount: number }> {
        const info = await redis.info("stats");
        const stats = info.split("\r\n").reduce((acc, line) => {
            if (line.includes("keyspace_hits:")) {
                const hits = parseInt(line.split(":")[1]);
                return { ...acc, hitCount: hits };
            }
            if (line.includes("keyspace_misses:")) {
                const misses = parseInt(line.split(":")[1]);
                return { ...acc, missCount: misses };
            }
            return acc;
        }, { hitCount: 0, missCount: 0 });

        const total = stats.hitCount + stats.missCount;
        const hitRate = total === 0 ? 0 : parseFloat(((stats.hitCount / total) * 100).toFixed(2));

        return {
            hitRate: parseFloat(hitRate),
            ...stats
        };
    }

    static async clearAllPermissionCache(): Promise<void> {
        const keys = await redis.keys("wolf:permissions:*");
        if (keys.length > 0) {
            await redis.del(...keys);
            console.log(`[PermissionCacheService] 清除了 ${keys.length} 个权限缓存`);
        }
    }

    static async clearAllTokenCache(): Promise<void> {
        const keys = await redis.keys("wolf:token:*");
        if (keys.length > 0) {
            await redis.del(...keys);
            console.log(`[PermissionCacheService] 清除了 ${keys.length} 个Token缓存`);
        }
    }

    static async clearAllCache(): Promise<void> {
        await this.clearAllPermissionCache();
        await this.clearAllTokenCache();
        console.log("[PermissionCacheService] 所有权限相关缓存已清空");
    }
}
