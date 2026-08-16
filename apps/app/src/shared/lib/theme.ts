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

  if (stored === "system") {
    return "System";
  }

  return "Light";
};

let isLightLocked = false;

const paint = (choice: ThemeChoice) => {
  document.documentElement.dataset.theme = isLightLocked
    ? "light"
    : choice === "System"
      ? systemTheme()
      : choice.toLowerCase();
};

export const applyTheme = (choice: ThemeChoice) => {
  localStorage.setItem(storageKey, choice.toLowerCase());
  paint(choice);
};

/** Signed-out screens ship a fixed light design, so they opt out of the theme. */
export const lockLightTheme = () => {
  isLightLocked = true;
  document.documentElement.dataset.theme = "light";
};

export const unlockTheme = () => {
  isLightLocked = false;
  paint(readTheme());
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
