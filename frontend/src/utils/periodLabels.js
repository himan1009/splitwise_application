import { formatMonth, getCurrentMonth, shiftMonth } from "./format";

export const PERIOD_PRESETS = [
  { id: "month", label: "Monthly", short: "Month" },
  { id: "quarter", label: "Quarterly", short: "Quarter" },
  { id: "half", label: "Half-year", short: "Half" },
  { id: "year", label: "Yearly", short: "Year" },
];

export function formatPeriodTitle(preset, anchor, labelKey) {
  const [year, month] = anchor.split("-").map(Number);
  if (preset === "month") return formatMonth(anchor);
  if (preset === "quarter") {
    const q = Math.ceil(month / 3);
    const ranges = ["Jan–Mar", "Apr–Jun", "Jul–Sep", "Oct–Dec"];
    return `Q${q} ${year} · ${ranges[q - 1]}`;
  }
  if (preset === "half") {
    return month <= 6 ? `Jan–Jun ${year}` : `Jul–Dec ${year}`;
  }
  if (preset === "year") return `Calendar year ${labelKey || year}`;
  return labelKey || anchor;
}

export function formatPeriodSubtitle(preset) {
  if (preset === "month") return "Single month drill-down";
  if (preset === "quarter") return "3 calendar months in this quarter";
  if (preset === "half") return "6 months — first or second half of year";
  if (preset === "year") return "Full-year income, spending & trends";
  return "";
}

export function shiftPeriodAnchor(preset, anchor, direction) {
  const [year, month] = anchor.split("-").map(Number);
  if (preset === "month") return shiftMonth(anchor, direction);
  if (preset === "quarter") return shiftMonth(anchor, direction * 3);
  if (preset === "half") return shiftMonth(anchor, direction * 6);
  if (preset === "year") {
    const y = year + direction;
    const m = String(month).padStart(2, "0");
    return `${y}-${m}`;
  }
  return anchor;
}

export { getCurrentMonth };