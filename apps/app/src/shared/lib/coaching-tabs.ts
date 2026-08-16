export const coachingTabs = ["Negotiation", "Interview practice"] as const;

export type CoachingTab = (typeof coachingTabs)[number];
