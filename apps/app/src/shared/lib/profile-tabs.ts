export const profileTabs = ["Account", "Resume", "Saved jobs", "About"] as const;

export type ProfileTab = (typeof profileTabs)[number];
