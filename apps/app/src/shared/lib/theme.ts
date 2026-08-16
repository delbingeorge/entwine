export const themeChoices = ["System", "Light", "Dark"] as const;

export type ThemeChoice = (typeof themeChoices)[number];

const storageKey = "entwine-theme";
const darkQuery = "(prefers-color-scheme: dark)";

const systemTheme = () => (window.matchMedia(darkQuery).matches ? "dark" : "light");

export const readTheme = (): ThemeChoice => {
  const stored = localStorage.getItem(storageKey);

  if (stored === "dark") {
    return "Dark";
  }

  if (stored === "light") {
    return "Light";
  }

  return "System";
};

export const applyTheme = (choice: ThemeChoice) => {
  const resolved = choice === "System" ? systemTheme() : choice.toLowerCase();

  document.documentElement.dataset.theme = resolved;

  if (choice === "System") {
    localStorage.removeItem(storageKey);

    return;
  }

  localStorage.setItem(storageKey, resolved);
};

/** Keep following the system while no explicit choice is stored. */
export const watchSystemTheme = () => {
  const media = window.matchMedia(darkQuery);

  const onChange = () => {
    if (readTheme() === "System") {
      applyTheme("System");
    }
  };

  media.addEventListener("change", onChange);

  return () => {
    media.removeEventListener("change", onChange);
  };
};
