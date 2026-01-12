import TitleBase, { TitleStatus, TitleStatusType } from "./index";
import { titleLibrary } from "./index";
import TitleService from "./TitleService";

export interface TitleStatusChangeEvent {
    titleId: string;
    oldStatus: TitleStatusType;
    newStatus: TitleStatusType;
    changedAt: Date;
    reason?: string;
    metadata?: Record<string, any>;
}

export default class TitleLifecycleManager {
    private statusChangeHandlers: ((event: TitleStatusChangeEvent) => void)[] = [];
    private checkInterval: NodeJS.Timeout | null = null;
    private checkIntervalMs: number = 60 * 60 * 1000; // 1 hour

    constructor() {
        this.init();
    }

    private init(): void {
        this.registerStatusChangeHandler(this.onStatusChange.bind(this));
        this.startPeriodicCheck();
        console.log("TitleLifecycleManager initialized");
    }

    /**
     * Start periodic title status check
     * @param intervalMs Check interval in milliseconds
     */
    startPeriodicCheck(intervalMs: number = this.checkIntervalMs): void {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
        
        this.checkIntervalMs = intervalMs;
        this.checkInterval = setInterval(async () => {
            await this.checkAllTitles();
        }, intervalMs);
        
        console.log(`Periodic title check started with interval ${intervalMs}ms`);
    }

    /**
     * Stop periodic title status check
     */
    stopPeriodicCheck(): void {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
            console.log("Periodic title check stopped");
        }
    }

    /**
     * Check all titles status
     */
    async checkAllTitles(): Promise<void> {
        console.log("Checking all titles status...");
        
        const allTitles = titleLibrary.getAllTitles();
        let changedCount = 0;
        
        for (const title of allTitles) {
            const oldStatus = title.status;
            const expired = title.checkExpiration();
            
            if (expired) {
                changedCount++;
                this.emitStatusChangeEvent({
                    titleId: title.id,
                    oldStatus,
                    newStatus: TitleStatus.EXPIRED,
                    changedAt: new Date(),
                    reason: "title_expired",
                    metadata: { expiredAt: title.expiredAt }
                });
            }
        }
        
        console.log(`Title status check completed. ${changedCount} titles changed status.`);
        
        // Update expired titles in database
        await TitleService.checkAndUpdateExpiredTitles();
    }

    /**
     * Check single title status
     * @param titleId Title ID
     */
    checkTitleStatus(titleId: string): boolean {
        const title = titleLibrary.getTitleById(titleId);
        if (!title) {
            return false;
        }
        
        const oldStatus = title.status;
        const statusChanged = title.checkExpiration();
        
        if (statusChanged) {
            this.emitStatusChangeEvent({
                titleId: title.id,
                oldStatus,
                newStatus: title.status,
                changedAt: new Date(),
                reason: "manual_check",
                metadata: { checkedAt: new Date() }
            });
        }
        
        return statusChanged;
    }

    /**
     * Update title status
     * @param titleId Title ID
     * @param newStatus New status
     * @param reason Reason for status change
     * @param metadata Additional metadata
     */
    async updateTitleStatus(
        titleId: string,
        newStatus: TitleStatusType,
        reason?: string,
        metadata?: Record<string, any>
    ): Promise<boolean> {
        const title = titleLibrary.getTitleById(titleId);
        if (!title) {
            return false;
        }
        
        const oldStatus = title.status;
        if (oldStatus === newStatus) {
            return false;
        }
        
        // Update title status in memory
        title.updateStatus(newStatus);
        
        // Update title status in database
        await titleLibrary.updateTitle(title.id, { status: newStatus });
        
        // Emit status change event
        this.emitStatusChangeEvent({
            titleId: title.id,
            oldStatus,
            newStatus,
            changedAt: new Date(),
            reason,
            metadata
        });
        
        return true;
    }

    /**
     * Renew title
     * @param titleId Title ID
     * @param extensionDays Extension days
     */
    async renewTitle(titleId: string, extensionDays: number): Promise<boolean> {
        const title = titleLibrary.getTitleById(titleId);
        if (!title) {
            return false;
        }
        
        const now = new Date();
        const newExpiredAt = title.expiredAt && title.expiredAt > now
            ? new Date(title.expiredAt.getTime() + extensionDays * 24 * 60 * 60 * 1000)
            : new Date(now.getTime() + extensionDays * 24 * 60 * 60 * 1000);
        
        // Update expiredAt in memory
        title.expiredAt = newExpiredAt;
        
        // If title was expired, update status to active
        if (title.status === TitleStatus.EXPIRED) {
            title.updateStatus(TitleStatus.ACTIVE);
        }
        
        // Update in database
        await titleLibrary.updateTitle(title.id, { 
            expiredAt: newExpiredAt, 
            status: title.status 
        });
        
        // Emit status change event
        this.emitStatusChangeEvent({
            titleId: title.id,
            oldStatus: title.status === TitleStatus.ACTIVE ? TitleStatus.EXPIRED : title.status,
            newStatus: title.status,
            changedAt: new Date(),
            reason: "title_renewed",
            metadata: {
                extensionDays,
                newExpiredAt
            }
        });
        
        console.log(`Title ${title.id} renewed for ${extensionDays} days, new expired at ${newExpiredAt}`);
        return true;
    }

    /**
     * Extend title
     * @param titleId Title ID
     * @param delayDays Extension days
     */
    async extendTitle(titleId: string, delayDays: number): Promise<boolean> {
        // Extend title is same as renew title
        return this.renewTitle(titleId, delayDays);
    }

    /**
     * Revoke title
     * @param titleId Title ID
     * @param reason Reason for revocation
     */
    async revokeTitle(titleId: string, reason: string): Promise<boolean> {
        return this.updateTitleStatus(titleId, TitleStatus.INACTIVE, reason);
    }

    /**
     * Activate title
     * @param titleId Title ID
     * @param reason Reason for activation
     */
    async activateTitle(titleId: string, reason: string): Promise<boolean> {
        return this.updateTitleStatus(titleId, TitleStatus.ACTIVE, reason);
    }

    /**
     * Deactivate title
     * @param titleId Title ID
     * @param reason Reason for deactivation
     */
    async deactivateTitle(titleId: string, reason: string): Promise<boolean> {
        return this.updateTitleStatus(titleId, TitleStatus.INACTIVE, reason);
    }

    /**
     * Register status change handler
     * @param handler Status change handler
     */
    registerStatusChangeHandler(handler: (event: TitleStatusChangeEvent) => void): void {
        this.statusChangeHandlers.push(handler);
    }

    /**
     * Remove status change handler
     * @param handler Status change handler to remove
     */
    removeStatusChangeHandler(handler: (event: TitleStatusChangeEvent) => void): void {
        this.statusChangeHandlers = this.statusChangeHandlers.filter((h) => h !== handler);
    }

    /**
     * Emit status change event
     * @param event Status change event
     */
    private emitStatusChangeEvent(event: TitleStatusChangeEvent): void {
        for (const handler of this.statusChangeHandlers) {
            try {
                handler(event);
            } catch (error) {
                console.error(`Error in status change handler: ${error}`);
            }
        }
    }

    /**
     * Handle status change event
     * @param event Status change event
     */
    private onStatusChange(event: TitleStatusChangeEvent): void {
        console.log(
            `Title status changed: ${event.titleId} - ${event.oldStatus} -> ${event.newStatus} (Reason: ${event.reason})`
        );
        
        // Handle different status changes
        switch (event.newStatus) {
        case TitleStatus.EXPIRED:
            // Handle expired title
            this.handleExpiredTitle(event);
            break;
        case TitleStatus.ACTIVE:
            // Handle activated title
            this.handleActivatedTitle(event);
            break;
        case TitleStatus.INACTIVE:
            // Handle deactivated title
            this.handleDeactivatedTitle(event);
            break;
        case TitleStatus.PENDING:
            // Handle pending title
            this.handlePendingTitle(event);
            break;
        }
    }

    /**
     * Handle expired title
     * @param event Status change event
     */
    private handleExpiredTitle(event: TitleStatusChangeEvent): void {
        console.log(`Handling expired title: ${event.titleId}`);
        // TODO: Implement expired title handling logic
        // 1. Notify user
        // 2. Update user stats
        // 3. Remove from active titles
    }

    /**
     * Handle activated title
     * @param event Status change event
     */
    private handleActivatedTitle(event: TitleStatusChangeEvent): void {
        console.log(`Handling activated title: ${event.titleId}`);
        // TODO: Implement activated title handling logic
        // 1. Notify user
        // 2. Update user stats
        // 3. Add to active titles
    }

    /**
     * Handle deactivated title
     * @param event Status change event
     */
    private handleDeactivatedTitle(event: TitleStatusChangeEvent): void {
        console.log(`Handling deactivated title: ${event.titleId}`);
        // TODO: Implement deactivated title handling logic
        // 1. Notify user
        // 2. Update user stats
        // 3. Remove from active titles
    }

    /**
     * Handle pending title
     * @param event Status change event
     */
    private handlePendingTitle(event: TitleStatusChangeEvent): void {
        console.log(`Handling pending title: ${event.titleId}`);
        // TODO: Implement pending title handling logic
        // 1. Notify user
        // 2. Set up pending state
    }

    /**
     * Get expiring titles
     * @param days Days before expiration
     */
    getExpiringTitles(days: number = 7): TitleBase[] {
        return titleLibrary.getExpiringTitles(days);
    }

    /**
     * Get expired titles
     */
    getExpiredTitles(): TitleBase[] {
        return titleLibrary.getExpiredTitles();
    }

    /**
     * Get titles by status
     * @param status Title status
     */
    getTitlesByStatus(status: TitleStatusType): TitleBase[] {
        return titleLibrary.getTitlesByStatus(status);
    }
}

// Create singleton instance
export const titleLifecycleManager = new TitleLifecycleManager();
