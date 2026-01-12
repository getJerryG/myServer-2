/**
 * 缓存配置文件
 * 定义缓存键、TTL、策略等配置
 */

export const CACHE_KEYS = {
    // 用户相关
    USER_INFO: "user:info:{userId}",
    USER_BASIC_INFO: "user:basic:{userId}",
    USER_TITLES: "user:titles:{userId}",

    // 团队相关
    TEAM_INFO: "team:info:{teamId}",
    TEAM_MEMBERS: "team:members:{teamId}",
    TEAM_TITLES: "team:titles:{teamId}",

    // 游戏相关
    GAME_RECORD: "game:record:{recordId}",
    GAME_CONFIG: "game:config:{configId}",
    GAME_RULES: "game:rules:{gameType}",

    // 赛事相关
    CONTEST_INFO: "contest:info:{contestId}",
    CONTEST_RANKING: "contest:ranking:{contestId}",
    CONTEST_SCHEDULE: "contest:schedule:{contestId}",

    // 称号相关
    TITLE_INFO: "title:info:{titleId}",
    TITLE_LIST: "title:list:{category}:{page}:{limit}",
    POPULAR_TITLES: "title:popular:{limit}",
    EXPIRED_TITLES: "title:expired:{days}",
    TITLE_STATS: "title:stats",

    // 商品相关
    GOODS_INFO: "goods:info:{goodsId}",
    GOODS_LIST: "goods:list:{type}:{status}:{page}:{limit}",

    // 排名相关
    RANK_LIST: "rank:list:{rankType}:{period}",

    // 系统相关
    SYSTEM_CONFIG: "system:config:{key}",
    HOT_DATA: "hot:data:{type}"
};

/**
 * 缓存过期时间配置（秒）
 */
export const CACHE_TTL = {
    // 基础过期时间
    BASE_TTL: 300, // 5分钟
    
    // 用户相关
    USER_INFO: 3600, // 1小时
    USER_BASIC_INFO: 7200, // 2小时
    USER_TITLES: 1800, // 30分钟
    
    // 团队相关
    TEAM_INFO: 1800, // 30分钟
    TEAM_MEMBERS: 600, // 10分钟
    TEAM_TITLES: 1800, // 30分钟
    
    // 游戏相关
    GAME_RECORD: 600, // 10分钟
    GAME_CONFIG: 7200, // 2小时
    GAME_RULES: 86400, // 1天
    
    // 赛事相关
    CONTEST_INFO: 300, // 5分钟
    CONTEST_RANKING: 60, // 1分钟
    CONTEST_SCHEDULE: 1800, // 30分钟
    
    // 称号相关
    TITLE_INFO: 3600, // 1小时
    TITLE_LIST: 1800, // 30分钟
    POPULAR_TITLES: 3600, // 1小时
    EXPIRED_TITLES: 300, // 5分钟
    TITLE_STATS: 3600, // 1小时
    
    // 商品相关
    GOODS_INFO: 3600, // 1小时
    GOODS_LIST: 1800, // 30分钟
    
    // 排名相关
    RANK_LIST: 300, // 5分钟
    
    // 系统相关
    SYSTEM_CONFIG: 86400, // 1天
    HOT_DATA: 3600 // 1小时
};

/**
 * 缓存随机偏移时间（秒）
 */
export const CACHE_RANDOM_OFFSET = {
    SHORT: 60, // 1分钟
    MEDIUM: 300, // 5分钟
    LONG: 600 // 10分钟
};

/**
 * 缓存数据结构类型
 */
export const CACHE_DATA_STRUCTURE = {
    // 字符串类型
    STRING: "string",
    
    // 哈希类型
    HASH: "hash",
    
    // 有序集合类型
    SORTED_SET: "sorted_set",
    
    // 集合类型
    SET: "set",
    
    // 压缩字符串类型
    COMPRESSED_STRING: "compressed_string"
};

/**
 * 缓存策略配置
 */
export const CACHE_STRATEGIES = {
    // 用户信息缓存策略
    USER_INFO: {
        key: CACHE_KEYS.USER_INFO,
        ttl: CACHE_TTL.USER_INFO,
        dataStructure: CACHE_DATA_STRUCTURE.HASH,
        randomOffset: CACHE_RANDOM_OFFSET.MEDIUM,
        compress: false,
        bloomFilter: true,
        distributedLock: true
    },
    
    // 称号信息缓存策略
    TITLE_INFO: {
        key: CACHE_KEYS.TITLE_INFO,
        ttl: CACHE_TTL.TITLE_INFO,
        dataStructure: CACHE_DATA_STRUCTURE.HASH,
        randomOffset: CACHE_RANDOM_OFFSET.SHORT,
        compress: false,
        bloomFilter: true,
        distributedLock: true
    },
    
    // 称号列表缓存策略
    TITLE_LIST: {
        key: CACHE_KEYS.TITLE_LIST,
        ttl: CACHE_TTL.TITLE_LIST,
        dataStructure: CACHE_DATA_STRUCTURE.STRING,
        randomOffset: CACHE_RANDOM_OFFSET.MEDIUM,
        compress: false,
        bloomFilter: true,
        distributedLock: true
    },
    
    // 热门称号缓存策略
    POPULAR_TITLES: {
        key: CACHE_KEYS.POPULAR_TITLES,
        ttl: CACHE_TTL.POPULAR_TITLES,
        dataStructure: CACHE_DATA_STRUCTURE.STRING,
        randomOffset: CACHE_RANDOM_OFFSET.LONG,
        compress: false,
        bloomFilter: true,
        distributedLock: true
    }
};

/**
 * 缓存版本配置
 */
export const CACHE_VERSION = {
    USER: "v1",
    TEAM: "v1",
    GAME: "v1",
    CONTEST: "v1",
    TITLE: "v1",
    GOODS: "v1",
    RANK: "v1",
    SYSTEM: "v1"
};

/**
 * 生成缓存键
 * @param template 缓存键模板
 * @param params 模板参数
 * @param version 版本号
 * @returns 生成的缓存键
 */
export const generateCacheKey = (
    template: string,
    params: Record<string, string | number>,
    version?: string
): string => {
    let key = template;
    
    // 替换模板参数
    for (const [param, value] of Object.entries(params)) {
        key = key.replace(new RegExp(`\\{${param}\\}`, "g"), value.toString());
    }
    
    // 如果提供了版本号，添加到键末尾
    if (version) {
        key = `${key}:${version}`;
    }
    
    return key;
};

/**
 * 获取缓存策略
 * @param key 缓存键
 * @returns 对应的缓存策略
 */
export const getCacheStrategy = (key: string) => {
    const prefix = key.split(":")[0];
    
    switch (prefix) {
    case "user":
        return CACHE_STRATEGIES.USER_INFO;
    case "title":
        if (key.includes("list")) {
            return CACHE_STRATEGIES.TITLE_LIST;
        } else if (key.includes("popular")) {
            return CACHE_STRATEGIES.POPULAR_TITLES;
        } else {
            return CACHE_STRATEGIES.TITLE_INFO;
        }
    default:
        return {
            key,
            ttl: CACHE_TTL.BASE_TTL,
            dataStructure: CACHE_DATA_STRUCTURE.STRING,
            randomOffset: CACHE_RANDOM_OFFSET.SHORT,
            compress: false,
            bloomFilter: true,
            distributedLock: false
        };
    }
};
