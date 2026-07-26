import { formatCurrency, formatDate, formatMonth, formatTime } from "../utils/format";
import { sortEntriesByRecent } from "../utils/debt";
import { getCategoryMeta } from "../constants/categories";
import { buildSpendingInsights } from "../utils/spendingInsights";
import ReportHealthCard from "./ReportHealthCard";

export default function MonthlyReports({
  summary,
  entries,
  dailyData,
  month,
  prevSummary,
  onDayClick,
}) {
  const totalIncome = summary?.totalIncome ?? 0;
  const totalExpenses = summary?.totalExpenses ?? 0;
  const balance = summary?.balance ?? 0;
  const savingsRate =
    totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;

  const analysis = buildSpendingInsights({
    summary,
    entries,
    dailyData,
    prevSummary,
  });

  const incomeEntries = entries.filter((e) => e.type === "income");

  const incomeByCategory = {};
  incomeEntries.forEach((e) => {
    if (!incomeByCategory[e.category]) {
      incomeByCategory[e.category] = { total: 0, count: 0 };
    }
    incomeByCategory[e.category].total += e.amount;
    incomeByCategory[e.category].count += 1;
  });

  const topSpendingDays = [...dailyData]
    .filter((d) => d.expenses > 0)
    .sort((a, b) => b.expenses - a.expenses)
    .slice(0, 5);

  const hasData = entries.length > 0;

  if (!hasData) {
    return (
      <div className="empty-state">
        <div className="text-5xl mb-4">📊</div>
        <h3 className="section-title">No report data yet</h3>
        <p className="text-muted text-sm mt-2 max-w-sm mx-auto">
          Add your salary and expenses this month to see your full spending report, smart
          insights, and personalized suggestions here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="report-hero text-white">
        <div className="relative z-10 space-y-5">
          <div>
            <p className="text-white/70 text-sm font-medium">Monthly Report</p>
            <h2
              className="text-2xl sm:text-3xl font-bold mt-1"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              {formatMonth(month)}
            </h2>
          </div>

          <ReportHealthCard score={analysis.healthScore} health={analysis.health} />

          <div className="report-summary-box">
            <p className="report-summary-box-label">Month summary</p>
            <p className="summary-narrative">{analysis.narrative}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: "Income", value: formatCurrency(totalIncome) },
              { label: "Spent", value: formatCurrency(totalExpenses) },
              { label: "Remaining", value: formatCurrency(balance), warn: balance < 0 },
              { label: "Savings Rate", value: `${savingsRate}%` },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-white/60 text-xs">{s.label}</p>
                <p
                  className={`text-lg font-bold mt-0.5 ${s.warn ? "text-amber-300" : ""}`}
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {analysis.insights.length > 0 && (
        <div className="card">
          <h3 className="section-title mb-2 flex items-center gap-2">
            <span>🧠</span> Smart Insights & Suggestions
          </h3>
          <p className="text-sm text-dim mb-5">
            Personalized tips based on your spending patterns this month.
          </p>
          <div className="space-y-3">
            {analysis.insights.map((insight, i) => (
              <div
                key={i}
                className={`insight-card insight-card-${insight.type}`}
              >
                <span className="insight-card-icon" aria-hidden>
                  {insight.icon}
                </span>
                <div className="min-w-0">
                  <p className="insight-card-title">{insight.title}</p>
                  <p className="insight-card-message">{insight.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Essential spend",
            value: formatCurrency(analysis.stats.essentialSpend),
            sub: `${analysis.stats.essentialPct.toFixed(0)}% of expenses`,
            color: "from-emerald-500/20 to-teal-500/10",
            text: "text-emerald-400",
          },
          {
            label: "Lifestyle spend",
            value: formatCurrency(analysis.stats.discretionarySpend),
            sub: `${analysis.stats.discretionaryPct.toFixed(0)}% of expenses`,
            color: "from-amber-500/20 to-orange-500/10",
            text: "text-amber-400",
          },
          {
            label: "Avg daily spend",
            value: formatCurrency(analysis.stats.avgDailySpend),
            sub: `${analysis.stats.spendingDays} active days`,
            color: "from-cyan-500/20 to-indigo-500/10",
            text: "text-cyan-400",
          },
          {
            label: "Transactions",
            value: analysis.stats.expenseCount + analysis.stats.incomeCount,
            sub: `${analysis.stats.expenseCount} expenses · ${analysis.stats.incomeCount} income`,
            color: "from-violet-500/20 to-purple-500/10",
            text: "text-violet-400",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`card !p-4 bg-gradient-to-br ${s.color} border-white/10`}
          >
            <p className="text-xs font-semibold text-muted">{s.label}</p>
            <p
              className={`text-xl font-bold mt-1 ${s.text}`}
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              {s.value}
            </p>
            <p className="text-xs text-dim mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {analysis.discretionaryBreakdown.length > 0 && (
        <div className="card border border-amber-500/15 bg-amber-500/5">
          <h3 className="section-title mb-2 flex items-center gap-2">
            <span>🎭</span> Lifestyle & Non-Essential Breakdown
          </h3>
          <p className="text-sm text-dim mb-5">
            These categories are optional — high spend here may not align with your financial
            goals.
          </p>
          <div className="space-y-4">
            {analysis.discretionaryBreakdown.map((cat) => (
              <div key={cat._id}>
                <div className="flex justify-between text-sm mb-1.5 gap-2 flex-wrap report-line-row">
                  <span className="font-semibold text-slate-300 flex items-center gap-2">
                    <span>{cat.meta.icon}</span> {cat.meta.label}
                    {cat.flag && (
                      <span className="discretionary-flag">High vs income</span>
                    )}
                  </span>
                  <span className="text-muted text-right">
                    {formatCurrency(cat.total)} · {cat.pctOfExpenses.toFixed(0)}% of spend
                    {cat.pctOfIncome > 0 && ` · ${cat.pctOfIncome.toFixed(0)}% of income`}
                  </span>
                </div>
                <div className="progress-track h-2.5">
                  <div
                    className={`h-full rounded-full ${
                      cat.flag
                        ? "bg-gradient-to-r from-amber-400 to-orange-500"
                        : "bg-gradient-to-r from-amber-400/70 to-orange-400/70"
                    }`}
                    style={{ width: `${Math.min(cat.pctOfExpenses, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <span>🏷️</span> Spending by Category
          </h3>
          {!summary?.byCategory?.length ? (
            <p className="text-dim text-sm">No expenses recorded</p>
          ) : (
            <div className="space-y-4">
              {summary.byCategory.map((cat) => {
                const meta = getCategoryMeta(cat._id);
                const pct = totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0;
                const pctIncome =
                  totalIncome > 0 ? (cat.total / totalIncome) * 100 : 0;
                const isDiscretionary = analysis.discretionaryBreakdown.some(
                  (d) => d._id === cat._id
                );

                return (
                  <div key={cat._id}>
                    <div className="flex justify-between text-sm mb-1.5 gap-2 flex-wrap report-line-row">
                      <span className="font-semibold text-slate-300 flex items-center gap-2">
                        <span>{meta.icon}</span> {meta.label}
                        {isDiscretionary && pctIncome >= 20 && (
                          <span className="discretionary-flag">Review</span>
                        )}
                      </span>
                      <span className="text-muted">
                        {formatCurrency(cat.total)} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="progress-track h-2.5">
                      <div
                        className={`h-full rounded-full ${
                          isDiscretionary
                            ? "bg-gradient-to-r from-amber-400 to-orange-500"
                            : "bg-gradient-to-r from-rose-400 to-red-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <span>💰</span> Income Sources
          </h3>
          {Object.keys(incomeByCategory).length === 0 ? (
            <p className="text-dim text-sm">No income recorded</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(incomeByCategory)
                .sort(([, a], [, b]) => b.total - a.total)
                .map(([cat, data]) => {
                  const meta = getCategoryMeta(cat);
                  const pct = totalIncome > 0 ? (data.total / totalIncome) * 100 : 0;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1.5 report-line-row gap-2">
                        <span className="font-semibold text-slate-300 flex items-center gap-2">
                          <span>{meta.icon}</span> {meta.label}
                        </span>
                        <span className="text-muted">
                          {formatCurrency(data.total)} ({pct.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="progress-track h-2.5">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="section-title mb-4 flex items-center gap-2">
          <span>🔥</span> Top Spending Days
        </h3>
        {topSpendingDays.length === 0 ? (
          <p className="text-dim text-sm">No spending days yet</p>
        ) : (
          <div className="space-y-1">
            {topSpendingDays.map((day, i) => (
              <button
                key={day._id}
                onClick={() => onDayClick(day._id)}
                className="list-item w-full group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-red-500/15 text-red-400 border border-red-500/20 flex items-center justify-center text-sm font-bold">
                    #{i + 1}
                  </span>
                  <span className="font-semibold text-slate-300 group-hover:text-cyan-400 transition">
                    {formatDate(day._id)}
                  </span>
                </div>
                <span className="font-bold text-red-400">
                  {formatCurrency(day.expenses)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="section-title mb-4 flex items-center gap-2">
          <span>📋</span> Recent Activity
        </h3>
        <div className="space-y-1">
          {sortEntriesByRecent(entries)
            .slice(0, 8)
            .map((entry) => {
              const meta = getCategoryMeta(entry.category);
              return (
                <div key={entry._id} className="list-item !py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="icon-box text-lg shrink-0">{meta.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-300 truncate">
                        {meta.label}
                        {entry.message && (
                          <span className="text-dim font-normal"> — {entry.message}</span>
                        )}
                      </p>
                      <p className="text-xs text-dim tabular-nums">
                        {formatDate(entry.date)} · {formatTime(entry.date)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-bold text-sm ${
                      entry.type === "income" ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {entry.type === "income" ? "+" : "−"}
                    {formatCurrency(entry.amount)}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
