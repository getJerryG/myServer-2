import type { UserType } from "@/types/user";

export default class UserController {
    nickname: string;
    avatar: string | undefined;
    status: 0 | 1 | 2 | 3 | 4; // 0: 离线, 1: 在线, 2: 游戏中, 3: 观战中, 4: 房间中
    role: 0 | 1 | 2; // 0: 普通玩家, 1: 管理员, 2: 超级管理员
    user_title: { title: string; createTime: Date }[];
    openId: string;
    session_key: string;
    sex: 0 | 1 | 2; // 0: 未知, 1: 男
    permission: number;
    
    constructor(userData: Partial<UserType> = {}) {
        const {
            nickname = "",
            avatar = undefined,
            status = 0,
            role = 0,
            user_title = [],
            openId = "",
            session_key = "",
            sex = 0,
            permission = 0
        } = userData;
        
        this.nickname = nickname;
        this.avatar = avatar;
        this.status = status;
        this.role = role;
        this.user_title = user_title;
        this.openId = openId;
        this.session_key = session_key;
        this.sex = sex;
        this.permission = permission;
    }
}