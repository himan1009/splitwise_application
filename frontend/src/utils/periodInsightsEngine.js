import { formatCurrency } from "./format";
import { getCategoryMeta } from "../constants/categories";
import {
  buildSpendingInsights,
  DISCRETIONARY_CATEGORIES,
  ESSENTIAL_CATEGORIES,
} from "./spendingInsights";
import {
  buildCategoryAnalytics,
  buildIncomeCategoryAnalytics,
  buildIncomeByCategory,
} from "./categoryAnalytics";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function pctChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function buildDailyFromEntries(entries) {
  const map = {};
  entries.forEach((e) => {
    const d = new Date(e.date);
    if (Number.isNaN(d.getTime())) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!map[key]) {
      map[key] = { _id: key, income: 0, expenses: 0, entryCount: 0, net: 0 };
    }
    map[key].entryCount += 1;
    if (e.type === "income") map[key].income += Number(e.amount);
    else map[key].expenses += Number(e.amount);
    map[key].net = map[key].income - map[key].expenses;
  });
  return Object.values(map).sort((a, b) => a._id.localeCompare(b._id));
}

export function buildWeekdaySpend(entries) {
  const totals = Array(7).fill(0);
  const counts = Array(7).fill(0);
  entries
    .filter((e) => e.type === "expense")
    .forEach((e) => {
      const d = new Date(e.date);
      const w = d.getDay();
      totals[w] += Number(e.amount);
      counts[w] += 1;
    });
  const max = Math.max(...totals, 1);
  return WEEKDAY_LABELS.map((label, i) => ({
    label,
    total: totals[i],
    count: counts[i],
    pct: max > 0 ? (totals[i] / max) * 100 : 0,
  }));
}

export function buildMaintenancePlan({
  totalIncome,
  totalExpenses,
  byCategory = [],
  previousPeriod = {},
  expenseCategories = [],
}) {
  const actions = [];
  const balance = totalIncome - totalExpenses;
  const expenseDelta = pctChange(totalExpenses, previousPeriod.totalExpenses || 0);

  if (totalIncome > 0 && totalExpenses > totalIncome) {
    actions.push({
      priority: "critical",
      title: "Spending exceeds income",
      detail: `Cut about ${formatCurrency(totalExpenses - totalIncome)} from discretionary categories this period.`,
      category: null,
    });
  }

  if (expenseDelta > 12 && (previousPeriod.totalExpenses || 0) > 0) {
    actions.push({
      priority: "high",
      title: "Spending is rising",
      detail: `Expenses up ${expenseDelta.toFixed(0)}% vs the previous ${"period"}. Review subscriptions, food, and travel first.`,
      category: null,
    });
  }

  expenseCategories
    .filter((c) => c.pctOfIncome >= 18 && c.isDiscretionary)
    .slice(0, 4)
    .forEach((c) => {
      actions.push({
        priority: "medium",
        title: `Cap ${c.meta.label}`,
        detail: `${c.pctOfIncome.toFixed(0)}% of income — aim for under 12%. Try a weekly limit.`,
        category: c._id,
      });
    });

  const top = byCategory[0];
  if (top && totalExpenses > 0 && top.total / totalExpenses > 0.35) {
    const meta = getCategoryMeta(top._id);
    actions.push({
      priority: "medium",
      title: `Heavy ${meta.label} spend`,
      detail: `${((top.total / totalExpenses) * 100).toFixed(0)}% of all spending — split or batch purchases.`,
      category: top._id,
    });
  }

  if (totalIncome > 0 && balance / totalIncome < 0.1 && balance >= 0) {
    actions.push({
      priority: "low",
      title: "Build savings buffer",
      detail: "Savings rate under 10%. Auto-transfer a fixed amount on payday.",
      category: null,
    });
  }

  const essentialSpend = byCategory
    .filter((c) => ESSENTIAL_CATEGORIES.includes(c._id))
    .reduce((s, c) => s + c.total, 0);
  const discSpend = byCategory
    .filter((c) => DISCRETIONARY_CATEGORIES.includes(c._id))
    .reduce((s, c) => s + c.total, 0);
  if (totalExpenses > 0 && discSpend / totalExpenses > 0.4) {
    actions.push({
      priority: "high",
      title: "Lifestyle share is high",
      detail: `${((discSpend / totalExpenses) * 100).toFixed(0)}% discretionary vs ${((essentialSpend / totalExpenses) * 100).toFixed(0)}% essentials.`,
      category: null,
    });
  }

  return actions.slice(0, 8);
}

export function buildWhereYouSpendMore(byCategory, totalExpenses, limit = 6) {
  return byCategory.slice(0, limit).map((c, index) => {
    const meta = getCategoryMeta(c._id);
    const share = totalExpenses > 0 ? (c.total / totalExpenses) * 100 : 0;
    const isDisc = DISCRETIONARY_CATEGORIES.includes(c._id);
    const isEss = ESSENTIAL_CATEGORIES.includes(c._id);
    return {
      rank: index + 1,
      id: c._id,
      meta,
      total: c.total,
      count: c.count,
      share,
      tone: isEss ? "essential" : isDisc ? "discretionary" : "neutral",
      insight:
        share >= 25
          ? "Dominates your spend — track weekly."
          : share >= 12
          ? "Material share — worth a sub-budget."
          : "Smaller slice — occasional check is enough.",
    };
  });
}

export function buildPeriodInsightBundle(apiData) {
  const {
    totalIncome,
    totalExpenses,
    balance,
    byCategory,
    byIncomeCategory,
    monthlyBuckets,
    entries,
    previousPeriod,
    preset,
  } = apiData;

  const summary = {
    totalIncome,
    totalExpenses,
    balance,
    byCategory,
  };

  const dailyData = buildDailyFromEntries(entries);
  const prevSummary = previousPeriod
    ? {
        totalIncome: previousPeriod.totalIncome,
        totalExpenses: previousPeriod.totalExpenses,
        balance: previousPeriod.balance,
      }
    : null;

  const core = buildSpendingInsights({
    summary,
    entries,
    dailyData,
    prevSummary,
  });

  const expenseCategories = buildCategoryAnalytics({
    byCategory,
    entries,
    totalExpenses,
    totalIncome,
  });

  const incomeCategories = buildIncomeCategoryAnalytics({
    incomeByCategory: buildIncomeByCategory(entries),
    totalIncome,
  });

  const maintenance = buildMaintenancePlan({
    totalIncome,
    totalExpenses,
    byCategory,
    previousPeriod,
    expenseCategories,
  });

  const spendRank = buildWhereYouSpendMore(byCategory, totalExpenses);
  const weekdayPattern = buildWeekdaySpend(entries);

  const comparisons = {
    incomeChange: pctChange(totalIncome, previousPeriod?.totalIncome || 0),
    expenseChange: pctChange(totalExpenses, previousPeriod?.totalExpenses || 0),
    balanceChange:
      (previousPeriod?.balance ?? 0) !== 0 || balance !== 0
        ? balance - (previousPeriod?.balance ?? 0)
        : 0,
  };

  const avgMonthlySpend =
    monthlyBuckets.length > 0
      ? totalExpenses / monthlyBuckets.length
      : totalExpenses;

  const suggestions = [
    ...core.insights.map((i) => ({ ...i, source: "smart" })),
    ...maintenance.map((m) => ({
      type: m.priority === "critical" ? "danger" : m.priority === "high" ? "warning" : "info",
      icon: m.priority === "critical" ? "🚨" : m.priority === "high" ? "📉" : "💡",
      title: m.title,
      message: m.detail,
      source: "maintain",
    })),
  ].slice(0, 10);

  return {
    core,
    expenseCategories,
    incomeCategories,
    maintenance,
    spendRank,
    weekdayPattern,
    comparisons,
    avgMonthlySpend,
    suggestions,
    preset,
    monthlyBuckets: monthlyBuckets || [],
  };
}