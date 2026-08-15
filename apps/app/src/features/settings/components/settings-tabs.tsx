import { settingsTabs, type SettingsTab } from "../tabs";

interface SettingsTabsProps {
  current: SettingsTab;
  onChange: (tab: SettingsTab) => void;
}

export const SettingsTabs = ({ current, onChange }: SettingsTabsProps) => (
  <div className="mt-5 flex gap-6 border-b border-composer-line">
    {settingsTabs.map((tab) => (
      <button
        className={`-mb-px border-b-2 pb-2.5 text-[14px] ${
          tab === current
            ? "border-composer-ink text-composer-ink"
            : "border-transparent text-composer-soft hover:text-composer-ink"
        }`}
        key={tab}
        onClick={() => {
          onChange(tab);
        }}
        type="button"
      >
        {tab}
      </button>
    ))}
  </div>
);
