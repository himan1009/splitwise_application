import { getCategoryMeta } from "../constants/categories";
import { formatCurrency } from "./format";
import { ESSENTIAL_CATEGORIES, DISCRETIONARY_CATEGORIES } from "./spendingInsights";

export function buildIncomeByCategory(entries) {
  const map = {};
  entries
    .filter((e) => e.type === "income")
    .forEach((e) => {
      if (!map[e.category]) {
        map[e.category] = { total: 0, count: 0 };
      }
      map[e.category].total += Number(e.amount);
      map[e.category].count += 1;
    });
  return map;
}

export function buildCategoryAnalytics({ byCategory = [], entries = [], totalExpenses = 0, totalIncome = 0 }) {
  const expenseEntries = entries.filter((e) => e.type === "expense");

  return byCategory.map((cat) => {
    const catEntries = expenseEntries.filter((e) => e.category === cat._id);
    const amounts = catEntries.map((e) => Number(e.amount));
    const maxTxn = amounts.length ? Math.max(...amounts) : 0;
    const avgTxn = cat.count > 0 ? cat.total / cat.count : 0;
    const meta = getCategoryMeta(cat._id);
    const isEssential = ESSENTIAL_CATEGORIES.includes(cat._id);
    const isDiscretionary = DISCRETIONARY_CATEGORIES.includes(cat._id);

    return {
      ...cat,
      meta,
      pctOfExpenses: totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0,
      pctOfIncome: totalIncome > 0 ? (cat.total / totalIncome) * 100 : 0,
      avgTxn,
      maxTxn,
      isEssential,
      isDiscretionary,
      type: "expense",
    };
  });
}

export function buildIncomeCategoryAnalytics({ incomeByCategory, totalIncome = 0 }) {
  return Object.entries(incomeByCategory)
    .map(([id, data]) => ({
      _id: id,
      total: data.total,
      count: data.count,
      meta: getCategoryMeta(id),
      pctOfIncome: totalIncome > 0 ? (data.total / totalIncome) * 100 : 0,
      avgTxn: data.count > 0 ? data.total / data.count : 0,
      type: "income",
    }))
    .sort((a, b) => b.total - a.total);
}

export function getCategoryBarTone(cat) {
  if (cat.type === "income") return "income";
  if (cat.isDiscretionary) return "discretionary";
  if (cat.isEssential) return "essential";
  return "default";
}

export function formatCategoryInsightLine(cat) {
  const parts = [
    formatCurrency(cat.total),
    `${cat.pctOfExpenses?.toFixed?.(0) ?? cat.pctOfIncome?.toFixed?.(0) ?? 0}%`,
    `${cat.count} txn${cat.count !== 1 ? "s" : ""}`,
  ];
  if (cat.avgTxn > 0) {
    parts.push(`avg ${formatCurrency(cat.avgTxn)}`);
  }
  return parts.join(" · ");
}
