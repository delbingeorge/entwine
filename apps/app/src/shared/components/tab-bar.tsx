interface TabBarProps<T extends string> {
  current: T;
  onChange: (tab: T) => void;
  tabs: readonly T[];
}

export const TabBar = <T extends string>({ current, onChange, tabs }: TabBarProps<T>) => (
  <div className="mt-5 flex gap-6 border-b border-composer-line">
    {tabs.map((tab) => (
      <button
        className={`-mb-px border-b-2 pb-2.5 text-[14px] whitespace-nowrap ${
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
