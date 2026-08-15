const monthYear = new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric" });

const label = (value: string | undefined) => {
  if (value === undefined || value === "") {
    return "";
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? "" : monthYear.format(parsed);
};

export const formatPeriod = (startDate: string | undefined, endDate: string | undefined) => {
  const start = label(startDate);
  const end = label(endDate);

  if (start === "" && end === "") {
    return "";
  }

  if (start === "") {
    return end;
  }

  return `${start} — ${end === "" ? "Present" : end}`;
};
