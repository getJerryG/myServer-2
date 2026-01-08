import Team, { PlayerAllocation } from "./index";
import Clan from "@/models/clan/Clan";

export default class Teams {
    private static data = new Map<string, Team>();

    static addTeam(team: Team) {
        this.data.set(team.name, team);
    }

    static getAllTeams(): Team[] {
        return Array.from(this.data.values());
    }

    static getTeamByName(teamName: string): Team | undefined {
        return this.data.get(teamName);
    }

    static getTeamsByClan(clan: Clan): Team[] {
        return Array.from(this.data.values()).filter(
            (team) => team.clan.name === clan.name
        );
    }

    static getTeamsByClanName(clanName: string): Team[] {
        return Array.from(this.data.values()).filter(
            (team) => team.clan.name === clanName
        );
    }

    static createTeam(options: {
        id?: number;
        name: string;
        leader: string;
        memberOps?: PlayerAllocation;
        clan: Clan;
        contestId?: string;
    }): Team {
        const team = new Team(options);
        this.addTeam(team);
        return team;
    }

    static removeTeam(teamName: string): boolean {
        const team = this.data.get(teamName);
        if (team) {
            team.destroy();
            return this.data.delete(teamName);
        }
        return false;
    }

    static getTeamCount(): number {
        return this.data.size;
    }

    static getTeamsByMember(nickName: string): Team[] {
        return Array.from(this.data.values()).filter((team) =>
            team.members.has(nickName)
        );
    }

    static getAllTeamNames(): string[] {
        return Array.from(this.data.keys());
    }

    static getTeamByUserId(userId: string): Team[] {
        return Array.from(this.data.values()).filter(
            (team) => team.leader === userId
        );
    }

    static getTeamsByContest(contestId: string): Team[] {
        return Array.from(this.data.values()).filter(
            (team) => team.contestId === contestId
        );
    }

    static removeTeamsByContest(contestId: string): number {
        const teams = this.getTeamsByContest(contestId);
        teams.forEach((team) => {
            this.removeTeam(team.name);
        });
        return teams.length;
    }

    static clear() {
        this.data.forEach((team) => {
            team.destroy();
        });
        this.data.clear();
    }
}
