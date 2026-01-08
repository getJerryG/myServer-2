import Clan from "../data/clan";
import ClanMember from "../data/clanMember";
import UserService from "models/User/services/userService";
import UserModel from "models/User/models/users";
import {
    IClan,
    IClanCreate,
    IClanUpdate,
    IClanMember,
    IClanListQuery,
    IClanMemberListQuery,
    IClanListResponse,
    IClanMemberListResponse,
    IClanDetail,
    MemberRole 
} from "../types/clan";
import mongoose from "mongoose";

/**
 * 家族服务类
 */
export default class ClanService {
    /**
     * 创建家族
     * @param userId 用户ID
     * @param clanData 家族数据
     */
    static async createClan(userId: number, clanData: IClanCreate): Promise<IClan> {
        try {
            // 获取用户信息
            const user = await UserService.getUser(null, 0, { userId }, true);
            if (!user) {
                throw new Error("用户不存在");
            }
            
            // 检查用户是否已经是其他家族成员
            const existingMember = await ClanMember.findOne({ userId: user._id });
            if (existingMember) {
                throw new Error("用户已经是其他家族成员");
            }
            
            // 创建家族
            const clan = new Clan({
                ...clanData,
                leader: user._id
            });
            await clan.save();
            
            // 创建家族成员记录
            const clanMember = new ClanMember({
                userId: user._id,
                clanId: clan._id,
                role: MemberRole.Leader,
                joinTime: new Date()
            });
            await clanMember.save();
            
            return clan.toObject() as IClan;
        } catch (error) {
            console.error("创建家族失败:", error);
            throw error;
        }
    }

    /**
     * 获取家族详情
     * @param clanId 家族ID
     * @param withMembers 是否包含成员信息
     */
    static async getClan(clanId: string, withMembers = false): Promise<IClanDetail | null> {
        try {
            const clan = await Clan.findById(clanId);
            if (!clan) {
                return null;
            }
            
            const clanData = clan.toObject() as IClanDetail;
            
            if (withMembers) {
                // 获取家族成员
                const members = await this.getClanMembers(clanId, {});
                clanData.members = members.members;
                clanData.memberCount = members.total;
            }
            
            return clanData;
        } catch (error) {
            console.error("获取家族详情失败:", error);
            return null;
        }
    }

    /**
     * 更新家族信息
     * @param clanId 家族ID
     * @param userId 操作人ID
     * @param clanData 更新数据
     */
    static async updateClan(clanId: string, userId: number, clanData: IClanUpdate): Promise<IClan | null> {
        try {
            // 获取操作人信息
            const operatorUser = await UserService.getUser(null, 0, { userId }, true);
            if (!operatorUser) {
                throw new Error("操作人不存在");
            }
            
            // 获取家族信息
            const clan = await Clan.findById(clanId);
            if (!clan) {
                throw new Error("家族不存在");
            }
            
            // 检查是否是家族 leader
            if (clan.leader.toString() !== operatorUser._id.toString()) {
                throw new Error("只有家族 leader 可以更新家族信息");
            }
            
            // 更新家族信息
            const updatedClan = await Clan.findByIdAndUpdate(
                clanId, 
                clanData, 
                { new: true }
            );
            
            return updatedClan?.toObject() as IClan | null;
        } catch (error) {
            console.error("更新家族信息失败:", error);
            return null;
        }
    }

    /**
     * 获取家族列表
     * @param query 查询条件
     */
    static async getClanList(query: IClanListQuery): Promise<IClanListResponse> {
        try {
            // 实现获取家族列表的逻辑
            return {
                clans: [],
                total: 0,
                page: query.page || 1,
                pageSize: query.pageSize || 10
            };
        } catch (error) {
            console.error("获取家族列表失败:", error);
            return {
                clans: [],
                total: 0,
                page: query.page || 1,
                pageSize: query.pageSize || 10
            };
        }
    }

    /**
     * 获取家族成员列表
     * @param clanId 家族ID
     * @param query 查询条件
     */
    static async getClanMembers(clanId: string, query: IClanMemberListQuery): Promise<IClanMemberListResponse> {
        try {
            // 实现获取家族成员列表的逻辑
            return {
                members: [],
                total: 0,
                page: query.page || 1,
                pageSize: query.pageSize || 10
            };
        } catch (error) {
            console.error("获取家族成员列表失败:", error);
            return {
                members: [],
                total: 0,
                page: query.page || 1,
                pageSize: query.pageSize || 10
            };
        }
    }
}