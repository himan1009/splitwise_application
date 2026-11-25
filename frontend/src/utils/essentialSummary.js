import { ESSENTIAL_CATEGORIES, DISCRETIONARY_CATEGORIES } from "./spendingInsights";

export function summarizeEssentialSpend(byCategory = [], totalExpenses = 0) {
  let essential = 0;
  let discretionary = 0;

  byCategory.forEach((c) => {
    if (ESSENTIAL_CATEGORIES.includes(c._id)) essential += c.total;
    else if (DISCRETIONARY_CATEGORIES.includes(c._id)) discretionary += c.total;
  });

  const other = Math.max(0, totalExpenses - essential - discretionary);
  const essentialPct = totalExpenses > 0 ? (essential / totalExpenses) * 100 : 0;
  const discretionaryPct = totalExpenses > 0 ? (discretionary / totalExpenses) * 100 : 0;

  let tip = "Log more expenses to see needs vs lifestyle split.";
  if (totalExpenses > 0) {
    if (discretionaryPct > 42) {
      tip = "Lifestyle spend is high — trim subscriptions, dining, and shopping first.";
    } else if (essentialPct > 55) {
      tip = "Mostly essentials — good discipline; watch rent, utilities, and EMIs.";
    } else {
      tip = "Balanced mix — set a weekly cap on your top discretionary category.";
    }
  }

  return {
    essential,
    discretionary,
    other,
    essentialPct,
    discretionaryPct,
    tip,
  };
}