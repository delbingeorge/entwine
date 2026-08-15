export const coachingTabs = ["Negotiation", "Interview practice", "Your own"] as const;

export type CoachingTab = (typeof coachingTabs)[number];
