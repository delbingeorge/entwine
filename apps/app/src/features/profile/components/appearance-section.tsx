import { useEffect, useState } from "react";

import { applyTheme, readTheme, themeChoices, watchSystemTheme } from "@/shared/lib/theme";

export const AppearanceSection = () => {
  const [choice, setChoice] = useState(readTheme);

  useEffect(watchSystemTheme, []);

  return (
    <section className="border-t border-composer-line pt-7">
      <h2 className="pb-4 text-[11px] tracking-widest text-composer-placeholder">APPEARANCE</h2>

      <div className="flex flex-col gap-3">
        <p className="text-[12.5px] leading-relaxed text-composer-soft">
          System follows whatever your device is set to.
        </p>

        <div className="flex w-fit gap-1 rounded-full border border-composer-line bg-composer-shell p-1">
          {themeChoices.map((entry) => (
            <button
              className={`rounded-full px-4 py-1.5 text-[12.5px] transition-colors ${
                entry === choice
                  ? "bg-composer-solid text-composer-solid-ink"
                  : "text-composer-soft hover:text-composer-ink"
              }`}
              key={entry}
              onClick={() => {
                applyTheme(entry);
                setChoice(entry);
              }}
              type="button"
            >
              {entry}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
