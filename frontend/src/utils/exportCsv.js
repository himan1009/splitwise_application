import { getCategoryMeta } from "../constants/categories";
import { splitDateTime } from "./format";

function escapeCsv(value) {
  const s = String(value ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function entriesToCsv(entries, monthLabel = "") {
  const header = ["date", "time", "type", "category", "amount", "note", "month"].join(",");
  const rows = entries.map((e) => {
    const { date, time } = splitDateTime(e.date);
    const meta = getCategoryMeta(e.category);
    return [
      date,
      time,
      e.type,
      meta.label,
      Number(e.amount).toFixed(2),
      e.message || "",
      monthLabel || date.slice(0, 7),
    ]
      .map(escapeCsv)
      .join(",");
  });
  return [header, ...rows].join("\n");
}

export function downloadTextFile(filename, content, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}