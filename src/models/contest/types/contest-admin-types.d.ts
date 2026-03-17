// ;
export interface ContestAdmin {
    userId: string;
    username: string;
    role: "creator" | "admin";
    createdAt: Date;
    permissions: {
        view: boolean;
        edit: boolean;
        submitData: boolean;
        manageAdmins: boolean;
    };
}
export interface ContestPublicityStage {
    stageId: string;
    stageName: string;
    auditStartTime: Date;
    auditEndTime: Date;
    publicityStartTime: Date;
    publicityEndTime: Date;
    status: "pending" | "auditing" | "publicity" | "completed";
    isDataSubmitted: boolean;
    submittedBy?: string;
    submittedAt?: Date;
}
