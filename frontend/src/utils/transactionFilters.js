import { getCategoryMeta } from "../constants/categories";
import { ESSENTIAL_CATEGORIES, DISCRETIONARY_CATEGORIES } from "./spendingInsights";
import { getTimestamp } from "./format";

export function filterTransactions(entries, { query = "", type = "all", lens = "all" }) {
  const q = query.trim().toLowerCase();
  return entries.filter((e) => {
    if (type !== "all" && e.type !== type) return false;
    if (lens === "essential" && e.type === "expense" && !ESSENTIAL_CATEGORIES.includes(e.category)) {
      return false;
    }
    if (lens === "lifestyle" && e.type === "expense" && !DISCRETIONARY_CATEGORIES.includes(e.category)) {
      return false;
    }
    if (!q) return true;
    const meta = getCategoryMeta(e.category);
    const haystack = `${meta.label} ${e.category} ${e.message || ""} ${e.type}`.toLowerCase();
    return haystack.includes(q);
  });
}

export function sortTransactions(entries, sortBy = "date_desc") {
  const list = [...entries];
  list.sort((a, b) => {
    if (sortBy === "amount_desc") return Number(b.amount) - Number(a.amount);
    if (sortBy === "amount_asc") return Number(a.amount) - Number(b.amount);
    if (sortBy === "date_asc") return getTimestamp(a.date) - getTimestamp(b.date);
    return getTimestamp(b.date) - getTimestamp(a.date);
  });
  return list;
}