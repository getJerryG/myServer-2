// ;

// ;
export * from "./contest-base-types";
// ;
export * from "./contest-schedule-types";
// ;
export * from "./contest-registration-types";
// ;
export * from "./contest-ranking-types";
// ;
export * from "./contest-admin-types";
// ;
export type ContestCreateType = Partial<
    Pick<
        import("./contest-base-types").IContest,
        | "name"
        | "type"
        | "rule"
        | "startDay"
        | "endDay"
        | "contestIntroduction"
        | "maxSignTeams"
        | "creatorId"
        | "creatorName"
        | "clanId"
        | "registrationType"
    >
>;