const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ["day", 86400000],
  ["hour", 3600000],
  ["minute", 60000],
];

const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export const relativeTime = (value: string | undefined) => {
  if (value === undefined) {
    return "no messages yet";
  }

  const elapsed = Date.now() - new Date(value).getTime();

  for (const [unit, size] of units) {
    if (elapsed >= size) {
      return formatter.format(-Math.floor(elapsed / size), unit);
    }
  }

  return "just now";
};
