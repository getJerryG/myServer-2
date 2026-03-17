import { Document, model, Schema, FilterQuery } from "mongoose";

type AnnouncementStatus = "draft" | "published" | "archived";
type AnnouncementType = "system" | "event" | "notification" | "promotion";
type AnnouncementCreatedRole = "superAdmin" | "admin" | "user";

interface IAnnouncement extends Document {
    title: string;
    content: string;
    author: string;
    status: AnnouncementStatus;
    type: AnnouncementType;
    startDate: Date;
    endDate?: Date;
    releaseDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const announcementSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["draft", "published", "archived"],
        default: "draft"
    },
    type: {
        type: String,
        enum: ["system", "event", "notification", "promotion"],
        default: "system"
    },
    releaseDate: {
        type: Date,
        default: Date.now
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date
    }
}, {
    timestamps: true
});

const AnnouncementModel = model<IAnnouncement>("Announcement", announcementSchema);

class Announcement {
    /**
     * 创建公告
     */
    static async create(data: Partial<IAnnouncement>): Promise<IAnnouncement> {
        const role = data.author as AnnouncementCreatedRole;
        const draftCount = await AnnouncementModel.countDocuments({
            status: "draft",
            author: data.author
        });
        
        if ((role === "user") || 
            (role === "admin" && draftCount >= 3) || 
            (role === "superAdmin" && draftCount >= 5)) {
            throw new Error(`${role} cannot create more drafts`);
        }
        
        const announcementData = {
            ...data,
            status: "draft" as AnnouncementStatus
        };
        
        return await AnnouncementModel.create(announcementData);
    }
    
    /**
     * 检查公告时间重叠
     */
    static async checkOverlap(
        type: AnnouncementType,
        startDate: Date,
        endDate?: Date
    ): Promise<boolean> {
        const query: FilterQuery<IAnnouncement> = {
            type,
            $or: [
                { startDate: { $lt: startDate }, endDate: { $gt: startDate }},
                {
                    startDate: { $lt: endDate || new Date(8640000000000000) },
                    endDate: { $gt: endDate || new Date(8640000000000000) }
                },
                { startDate: { $gt: startDate }, endDate: { $lt: endDate || new Date(8640000000000000) }},
                { startDate: { $lt: startDate }, endDate: { $exists: false }}
            ].filter(Boolean)
        };
        
        const count = await AnnouncementModel.countDocuments(query);
        return count > 0;
    }
    
    /**
     * 获取所有公告
     */
    static async getAll(filter: Partial<IAnnouncement> = {}): Promise<IAnnouncement[]> {
        return await AnnouncementModel.find(filter).sort({ createdAt: -1 });
    }
    
    /**
     * 发布公告
     */
    static async publish(id: string): Promise<IAnnouncement | null> {
        const announcement = await AnnouncementModel.findById(id);
        if (!announcement) {
            throw new Error("Announcement not found");
        }
        
        const hasOverlap = await this.checkOverlap(
            announcement.type,
            announcement.startDate,
            announcement.endDate
        );
        
        if (hasOverlap) {
            throw new Error("Announcement time overlaps with existing published announcements");
        }
        
        return await AnnouncementModel.findByIdAndUpdate(
            id,
            {
                status: "published" as AnnouncementStatus,
                releaseDate: new Date()
            },
            { new: true }
        );
    }
    
    /**
     * 获取当前活跃的公告
     */
    static async getActive(): Promise<IAnnouncement[]> {
        const now = new Date();
        
        return await AnnouncementModel.find({
            status: "published",
            releaseDate: { $lt: now },
            $or: [
                { endDate: { $exists: false }},
                { endDate: { $gt: now }}
            ]
        }).sort({ startDate: -1 });
    }
    
    /**
     * 更新公告
     */
    static async update(
        id: string,
        updateData: Partial<IAnnouncement>
    ): Promise<IAnnouncement | null> {
        return await AnnouncementModel.findByIdAndUpdate(id, updateData, { new: true });
    }
    
    /**
     * 删除公告
     */
    static async delete(id: string): Promise<IAnnouncement | null> {
        return await AnnouncementModel.findByIdAndDelete(id);
    }
}

export default Announcement;