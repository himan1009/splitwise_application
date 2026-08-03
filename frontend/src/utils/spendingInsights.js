import { formatCurrency } from "./format";
import { getCategoryMeta } from "../constants/categories";

export const ESSENTIAL_CATEGORIES = [
  "rent",
  "utilities",
  "health",
  "education",
  "transport",
  "groceries",
  "insurance",
  "emi_loans",
];

export const DISCRETIONARY_CATEGORIES = [
  "partying",
  "shopping",
  "entertainment",
  "food",
  "subscriptions",
  "travel",
  "personal_care",
  "charity",
];

const DISCRETIONARY_THRESHOLD_PCT = 35;
const CATEGORY_INCOME_WARNING_PCT = 20;
const LOW_SAVINGS_PCT = 15;
const GOOD_SAVINGS_PCT = 25;

function sumCategoryTotals(categories, ids) {
  return categories
    .filter((c) => ids.includes(c._id))
    .reduce((sum, c) => sum + c.total, 0);
}

function getSavingsRate(totalIncome, balance) {
  if (totalIncome <= 0) return null;
  return (balance / totalIncome) * 100;
}

function getHealthScore({ totalIncome, totalExpenses, balance, discretionaryPct, savingsRate }) {
  let score = 70;

  if (totalIncome > 0) {
    if (balance < 0) score -= 35;
    else if (savingsRate >= GOOD_SAVINGS_PCT) score += 20;
    else if (savingsRate >= LOW_SAVINGS_PCT) score += 8;
    else score -= 15;

    if (discretionaryPct > 45) score -= 20;
    else if (discretionaryPct > DISCRETIONARY_THRESHOLD_PCT) score -= 10;
    else if (discretionaryPct < 20) score += 5;
  } else if (totalExpenses > 0) {
    score -= 10;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function getHealthLabel(score) {
  if (score >= 80) {
    return {
      label: "Excellent",
      tone: "success",
      icon: "✅",
      hint: "Your finances are in great shape this month.",
    };
  }
  if (score >= 65) {
    return {
      label: "Good",
      tone: "info",
      icon: "👍",
      hint: "Solid month — a few tweaks could boost savings further.",
    };
  }
  if (score >= 45) {
    return {
      label: "Needs Attention",
      tone: "warning",
      icon: "⚠️",
      hint: "Spending patterns need a closer look — review insights below.",
    };
  }
  return {
    label: "Critical",
    tone: "danger",
    icon: "🚨",
    hint: "Urgent action needed — expenses may exceed your income.",
  };
}

export function buildSpendingInsights({
  summary,
  entries = [],
  dailyData = [],
  prevSummary = null,
}) {
  const totalIncome = summary?.totalIncome ?? 0;
  const totalExpenses = summary?.totalExpenses ?? 0;
  const balance = summary?.balance ?? 0;
  const byCategory = summary?.byCategory ?? [];

  const expenseEntries = entries.filter((e) => e.type === "expense");
  const incomeEntries = entries.filter((e) => e.type === "income");
  const savingsRate = getSavingsRate(totalIncome, balance);

  const biggestExpense = expenseEntries.reduce(
    (max, e) => (e.amount > (max?.amount ?? 0) ? e : max),
    null
  );
  const spendingDays = dailyData.filter((d) => d.expenses > 0).length;
  const daysInMonth = dailyData.length || 30;
  const noSpendDays = Math.max(0, daysInMonth - spendingDays);
  const categoryCount = byCategory.length;
  const prevExpenseChange =
    prevSummary && prevSummary.totalExpenses > 0
      ? ((totalExpenses - prevSummary.totalExpenses) / prevSummary.totalExpenses) * 100
      : null;
  const prevBalanceChange =
    prevSummary && prevSummary.balance !== undefined
      ? balance - prevSummary.balance
      : null;

  const essentialSpend = sumCategoryTotals(byCategory, ESSENTIAL_CATEGORIES);
  const discretionarySpend = sumCategoryTotals(byCategory, DISCRETIONARY_CATEGORIES);
  const discretionaryPct =
    totalExpenses > 0 ? (discretionarySpend / totalExpenses) * 100 : 0;
  const essentialPct =
    totalExpenses > 0 ? (essentialSpend / totalExpenses) * 100 : 0;

  const topCategory = byCategory[0] ?? null;
  const avgDailySpend = spendingDays > 0 ? totalExpenses / spendingDays : 0;
  const incomePerDay = totalIncome > 0 ? totalIncome / 30 : 0;

  const healthScore = getHealthScore({
    totalIncome,
    totalExpenses,
    balance,
    discretionaryPct,
    savingsRate,
  });
  const health = getHealthLabel(healthScore);

  const insights = [];

  if (totalIncome === 0 && totalExpenses > 0) {
    insights.push({
      type: "warning",
      icon: "⚠️",
      title: "Income not recorded",
      message:
        "You've logged expenses but no income this month. Add your salary or other income for accurate savings insights.",
    });
  }

  if (balance < 0) {
    insights.push({
      type: "danger",
      icon: "🚨",
      title: "Spending exceeds income",
      message: `You're overspent by ${formatCurrency(Math.abs(balance))} this month. Review discretionary categories like ${getDiscretionaryLabels(byCategory).join(", ") || "shopping & entertainment"} and cut back where possible.`,
    });
  } else if (savingsRate !== null && savingsRate < LOW_SAVINGS_PCT) {
    insights.push({
      type: "warning",
      icon: "📉",
      title: "Low savings rate",
      message: `Only ${savingsRate.toFixed(0)}% of income is left after expenses. Aim for at least ${LOW_SAVINGS_PCT}% by trimming non-essential spending.`,
    });
  } else if (savingsRate !== null && savingsRate >= GOOD_SAVINGS_PCT) {
    insights.push({
      type: "success",
      icon: "🎯",
      title: "Strong savings habit",
      message: `You're saving ${savingsRate.toFixed(0)}% of your income (${formatCurrency(balance)} left). Keep this up — consider moving surplus to investments.`,
    });
  }

  if (discretionaryPct >= DISCRETIONARY_THRESHOLD_PCT && totalExpenses > 0) {
    const topDiscretionary = byCategory.find((c) =>
      DISCRETIONARY_CATEGORIES.includes(c._id)
    );
    const topMeta = topDiscretionary ? getCategoryMeta(topDiscretionary._id) : null;

    insights.push({
      type: "warning",
      icon: "🎭",
      title: "High lifestyle spending",
      message: `${discretionaryPct.toFixed(0)}% of spending (${formatCurrency(discretionarySpend)}) went to non-essential categories like food, partying, shopping & entertainment.${
        topMeta
          ? ` ${topMeta.label} alone is ${formatCurrency(topDiscretionary.total)} — consider if that's aligned with your goals.`
          : ""
      }`,
    });
  }

  byCategory.forEach((cat) => {
    if (!DISCRETIONARY_CATEGORIES.includes(cat._id)) return;
    if (totalIncome <= 0) return;

    const pctOfIncome = (cat.total / totalIncome) * 100;
    if (pctOfIncome >= CATEGORY_INCOME_WARNING_PCT) {
      const meta = getCategoryMeta(cat._id);
      insights.push({
        type: "warning",
        icon: meta.icon,
        title: `High ${meta.label.toLowerCase()} spend`,
        message: `${meta.label} is ${formatCurrency(cat.total)} (${pctOfIncome.toFixed(0)}% of income, ${cat.count} transactions). This may not be essential — try setting a monthly cap.`,
      });
    }
  });

  if (topCategory && totalExpenses > 0) {
    const meta = getCategoryMeta(topCategory._id);
    const pct = (topCategory.total / totalExpenses) * 100;

    if (pct >= 40 && !insights.some((i) => i.title.includes(meta.label))) {
      insights.push({
        type: "info",
        icon: meta.icon,
        title: `Top spending: ${meta.label}`,
        message: `${meta.label} accounts for ${pct.toFixed(0)}% of all spending (${formatCurrency(topCategory.total)} across ${topCategory.count} transactions). Make sure this matches your priorities.`,
      });
    }
  }

  const frequentSmall = expenseEntries.filter((e) => e.amount < 500);
  const foodSmall = frequentSmall.filter((e) => e.category === "food");
  if (foodSmall.length >= 8) {
    const foodTotal = foodSmall.reduce((s, e) => s + e.amount, 0);
    insights.push({
      type: "tip",
      icon: "🍔",
      title: "Many small food purchases",
      message: `${foodSmall.length} food entries under ₹500 total ${formatCurrency(foodTotal)}. Small daily orders add up — meal prep or batch cooking could save significantly.`,
    });
  }

  if (avgDailySpend > 0 && incomePerDay > 0 && avgDailySpend > incomePerDay * 0.6) {
    insights.push({
      type: "warning",
      icon: "📅",
      title: "Heavy daily burn rate",
      message: `Average spend on active days is ${formatCurrency(avgDailySpend)}, while daily income pace is ~${formatCurrency(incomePerDay)}. You're burning through income quickly on spending days.`,
    });
  }

  if (prevSummary && prevSummary.totalExpenses > 0) {
    const change =
      ((totalExpenses - prevSummary.totalExpenses) / prevSummary.totalExpenses) * 100;
    if (Math.abs(change) >= 15) {
      insights.push({
        type: change > 0 ? "warning" : "success",
        icon: change > 0 ? "📈" : "📉",
        title: change > 0 ? "Spending increased vs last month" : "Spending decreased vs last month",
        message: `Total expenses are ${Math.abs(change).toFixed(0)}% ${
          change > 0 ? "higher" : "lower"
        } than last month (${formatCurrency(prevSummary.totalExpenses)} → ${formatCurrency(totalExpenses)}).`,
      });
    }
  }

  if (essentialPct >= 60 && totalExpenses > 0 && balance >= 0) {
    insights.push({
      type: "success",
      icon: "🏠",
      title: "Essential-focused spending",
      message: `${essentialPct.toFixed(0)}% went to essentials (rent, utilities, health, etc.). Your spending is mostly needs-based, which is a healthy pattern.`,
    });
  }

  if (insights.length === 0 && totalExpenses > 0) {
    insights.push({
      type: "tip",
      icon: "💡",
      title: "Spending looks balanced",
      message:
        "No major red flags this month. Keep tracking daily and review categories weekly to stay on top of your finances.",
    });
  }

  const narrative = buildNarrative({
    totalIncome,
    totalExpenses,
    balance,
    savingsRate,
    topCategory,
    expenseCount: expenseEntries.length,
    incomeCount: incomeEntries.length,
    spendingDays,
    discretionaryPct,
    essentialPct,
    health,
  });

  const discretionaryBreakdown = byCategory
    .filter((c) => DISCRETIONARY_CATEGORIES.includes(c._id))
    .map((c) => ({
      ...c,
      meta: getCategoryMeta(c._id),
      pctOfExpenses: totalExpenses > 0 ? (c.total / totalExpenses) * 100 : 0,
      pctOfIncome: totalIncome > 0 ? (c.total / totalIncome) * 100 : 0,
      flag: totalIncome > 0 && (c.total / totalIncome) * 100 >= CATEGORY_INCOME_WARNING_PCT,
    }));

  return {
    healthScore,
    health,
    narrative,
    insights: insights.slice(0, 8),
    stats: {
      savingsRate,
      discretionarySpend,
      discretionaryPct,
      essentialSpend,
      essentialPct,
      avgDailySpend,
      spendingDays,
      noSpendDays,
      expenseCount: expenseEntries.length,
      incomeCount: incomeEntries.length,
      categoryCount,
      biggestExpense,
      prevExpenseChange,
      prevBalanceChange,
    },
    discretionaryBreakdown,
  };
}

function getDiscretionaryLabels(byCategory) {
  return byCategory
    .filter((c) => DISCRETIONARY_CATEGORIES.includes(c._id))
    .slice(0, 3)
    .map((c) => getCategoryMeta(c._id).label.toLowerCase());
}

function buildNarrative({
  totalIncome,
  totalExpenses,
  balance,
  savingsRate,
  topCategory,
  expenseCount,
  incomeCount,
  spendingDays,
  discretionaryPct,
  essentialPct,
  health,
}) {
  const parts = [];

  if (totalIncome === 0 && totalExpenses === 0) {
    return "No financial activity recorded this month yet. Add your income and expenses to unlock personalized insights.";
  }

  parts.push(
    `This month you ${totalIncome > 0 ? `earned ${formatCurrency(totalIncome)}` : "haven't logged income"} and spent ${formatCurrency(totalExpenses)} across ${expenseCount} expense${expenseCount !== 1 ? "s" : ""}.`
  );

  if (totalIncome > 0) {
    if (balance < 0) {
      parts.push(
        `You're in the red by ${formatCurrency(Math.abs(balance))} — expenses exceeded income. Immediate cuts in non-essential areas are recommended.`
      );
    } else if (savingsRate !== null) {
      parts.push(
        `After all spending, ${formatCurrency(balance)} remains (${savingsRate.toFixed(0)}% savings rate). Overall financial health is rated "${health.label}".`
      );
    }
  }

  if (topCategory) {
    const meta = getCategoryMeta(topCategory._id);
    parts.push(
      `Your biggest expense category is ${meta.label} at ${formatCurrency(topCategory.total)}.`
    );
  }

  if (discretionaryPct > DISCRETIONARY_THRESHOLD_PCT) {
    parts.push(
      `About ${discretionaryPct.toFixed(0)}% of spending went to lifestyle categories — higher than the recommended ~${DISCRETIONARY_THRESHOLD_PCT}% ceiling for discretionary costs.`
    );
  } else if (essentialPct > 50 && totalExpenses > 0) {
    parts.push(
      `${essentialPct.toFixed(0)}% of spending covered essentials, showing a needs-first approach.`
    );
  }

  if (spendingDays > 0) {
    parts.push(
      `You had spending activity on ${spendingDays} day${spendingDays !== 1 ? "s" : ""} this month${incomeCount > 0 ? ` with ${incomeCount} income source${incomeCount !== 1 ? "s" : ""} logged` : ""}.`
    );
  }

  return parts.join(" ");
}
