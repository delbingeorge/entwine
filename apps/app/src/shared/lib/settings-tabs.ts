export const settingsTabs = ["Account", "Profile", "About"] as const;

export type SettingsTab = (typeof settingsTabs)[number];
