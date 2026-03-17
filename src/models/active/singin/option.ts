export const signinConfig = {
    isEnabled: true,
    isDaily: false,
    rewards: [
        { day: 1, reward: { gold: 100, item: "common" } },
        { day: 3, reward: { gold: 300, item: "uncommon" } },
        { day: 7, reward: { gold: 1000, item: "rare" } }
    ],
    clearCondition: 0
};