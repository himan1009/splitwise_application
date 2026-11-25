import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import PageLoader from "../components/ui/PageLoader";
import ReportHealthCard from "../components/ReportHealthCard";
import CategoryInsightsPanel from "../components/CategoryInsightsPanel";
import TrendBarChart from "../components/insights/TrendBarChart";
import CashflowAreaChart from "../components/insights/CashflowAreaChart";
import SplitDonut from "../components/insights/SplitDonut";
import {
  PERIOD_PRESETS,
  formatPeriodTitle,
  formatPeriodSubtitle,
  shiftPeriodAnchor,
  getCurrentMonth,
} from "../utils/periodLabels";
import { buildPeriodInsightBundle } from "../utils/periodInsightsEngine";
import { formatCurrency } from "../utils/format";
import { getApiErrorMessage } from "../utils/apiErrors";
import {
  DISCRETIONARY_CATEGORIES,
  ESSENTIAL_CATEGORIES,
} from "../utils/spendingInsights";

export default function Insights() {
  const [preset, setPreset] = useState("month");
  const [anchor, setAnchor] = useState(getCurrentMonth());
  const [raw, setRaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [focusCategory, setFocusCategory] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await api.get("/personal/insights/period", {
        params: { preset, anchor },
      });
      setRaw(res.data);
    } catch (err) {
      setRaw(null);
      setLoadError(getApiErrorMessage(err, "Could not load insights. Try again."));
    } finally {
      setLoading(false);
    }
  }, [preset, anchor]);

  useEffect(() => {
    load();
  }, [load]);

  const bundle = useMemo(() => (raw ? buildPeriodInsightBundle(raw) : null), [raw]);

  const essentialSpend = useMemo(() => {
    if (!raw?.byCategory) return 0;
    return raw.byCategory
      .filter((c) => ESSENTIAL_CATEGORIES.includes(c._id))
      .reduce((s, c) => s + c.total, 0);
  }, [raw]);

  const discretionarySpend = useMemo(() => {
    if (!raw?.byCategory) return 0;
    return raw.byCategory
      .filter((c) => DISCRETIONARY_CATEGORIES.includes(c._id))
      .reduce((s, c) => s + c.total, 0);
  }, [raw]);

  const otherSpend = useMemo(() => {
    if (!raw) return 0;
    const classified = essentialSpend + discretionarySpend;
    return Math.max(0, raw.totalExpenses - classified);
  }, [raw, essentialSpend, discretionarySpend]);

  const savingsRate =
    raw && raw.totalIncome > 0 ? (raw.balance / raw.totalIncome) * 100 : null;

  const title = raw ? formatPeriodTitle(preset, anchor, raw.labelKey) : "Insights";

  if (loading && !raw) {
    return <PageLoader message="Building your insights..." />;
  }

  return (
    <div className="page-container insights-page space-y-6">
      <div className="insights-hero">
        <div className="insights-hero-glow" aria-hidden />
        <div className="relative z-10">
          <p className="insights-eyebrow">FinTrack Intelligence</p>
          <h1 className="page-title text-white">Spending insights</h1>
          <p className="page-subtitle text-white/70 max-w-xl">
            {formatPeriodSubtitle(preset)} — where money goes, what to fix, and how you compare to last
            period.
          </p>
        </div>
      </div>

      <div className="card !p-3 sm:!p-4 space-y-4">
        <div className="insights-preset-grid">
          {PERIOD_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={preset === p.id ? "insights-preset-active insights-preset" : "insights-preset"}
              onClick={() => setPreset(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="insights-period-nav flex items-center gap-2 flex-1">
            <button
              type="button"
              className="month-nav-btn"
              onClick={() => setAnchor(shiftPeriodAnchor(preset, anchor, -1))}
              aria-label="Previous period"
            >
              ←
            </button>
            <span className="section-title text-center flex-1 px-2">{title}</span>
            <button
              type="button"
              className="month-nav-btn"
              onClick={() => setAnchor(shiftPeriodAnchor(preset, anchor, 1))}
              aria-label="Next period"
            >
              →
            </button>
          </div>
          <label className="insights-anchor-field">
            <span className="text-xs text-dim">Reference month</span>
            <input
              type="month"
              className="input !py-2 !text-sm"
              value={anchor}
              onChange={(e) => setAnchor(e.target.value)}
            />
          </label>
        </div>
      </div>

      {loadError && (
        <div className="card !p-4 border border-red-500/25 bg-red-500/10 text-red-300 text-sm flex justify-between gap-3">
          <span>{loadError}</span>
          <button type="button" onClick={load} className="btn-ghost !text-red-300 shrink-0">
            Retry
          </button>
        </div>
      )}

      {raw && bundle && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              {
                label: "Income",
                value: formatCurrency(raw.totalIncome),
                delta: bundle.comparisons.incomeChange,
                tone: "income",
              },
              {
                label: "Spent",
                value: formatCurrency(raw.totalExpenses),
                delta: bundle.comparisons.expenseChange,
                tone: "expense",
                invertDelta: true,
              },
              {
                label: "Net saved",
                value: formatCurrency(raw.balance),
                sub: savingsRate !== null ? `${savingsRate.toFixed(1)}% rate` : "—",
                tone: raw.balance >= 0 ? "balance" : "expense",
              },
              {
                label: "Transactions",
                value: raw.expenseCount + raw.incomeCount,
                sub: `${raw.expenseCount} expenses`,
                tone: "neutral",
              },
            ].map((kpi) => (
              <div key={kpi.label} className={`insights-kpi insights-kpi-${kpi.tone}`}>
                <p className="metric-label">{kpi.label}</p>
                <p className="insights-kpi-value">{kpi.value}</p>
                {kpi.sub && <p className="text-xs text-dim mt-1">{kpi.sub}</p>}
                {kpi.delta !== undefined && (
                  <p
                    className={`text-xs font-semibold mt-2 ${
                      (kpi.invertDelta ? kpi.delta < 0 : kpi.delta > 0)
                        ? "text-emerald-400"
                        : kpi.delta === 0
                        ? "text-slate-400"
                        : "text-amber-400"
                    }`}
                  >
                    {kpi.delta > 0 ? "+" : ""}
                    {kpi.delta.toFixed(1)}% vs last period
                  </p>
                )}
              </div>
            ))}
          </div>

          {bundle.core && (
            <ReportHealthCard score={bundle.core.healthScore} health={bundle.core.health} />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="card lg:col-span-2">
              <h3 className="section-title mb-1">Income vs spend trend</h3>
              <p className="text-dim text-sm mb-4">Month-by-month inside this period</p>
              <TrendBarChart buckets={bundle.monthlyBuckets} />
            </div>
            <div className="card">
              <h3 className="section-title mb-1">Net cashflow</h3>
              <p className="text-dim text-sm mb-4">Balance trajectory</p>
              <CashflowAreaChart buckets={bundle.monthlyBuckets} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="section-title mb-4">Essentials vs lifestyle</h3>
              <SplitDonut
                essential={essentialSpend}
                discretionary={discretionarySpend}
                other={otherSpend}
              />
              <p className="text-sm text-dim mt-4 leading-relaxed">{bundle.core?.narrative}</p>
            </div>
            <div className="card">
              <h3 className="section-title mb-4">Spend by weekday</h3>
              <div className="insights-weekday-grid">
                {bundle.weekdayPattern.map((d) => (
                  <div key={d.label} className="insights-weekday-cell">
                    <div className="insights-weekday-bar-track">
                      <div
                        className="insights-weekday-bar-fill"
                        style={{ height: `${Math.max(d.pct, 4)}%` }}
                      />
                    </div>
                    <span className="insights-weekday-label">{d.label}</span>
                    <span className="insights-weekday-amt">{formatCurrency(d.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="section-title mb-2">Where you spend more</h3>
            <p className="text-dim text-sm mb-4">Ranked categories — tap to highlight below</p>
            <div className="insights-rank-grid">
              {bundle.spendRank.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  className={
                    focusCategory === row.id
                      ? "insights-rank-card insights-rank-card-active"
                      : "insights-rank-card"
                  }
                  onClick={() => setFocusCategory(focusCategory === row.id ? null : row.id)}
                >
                  <span className="insights-rank-num">#{row.rank}</span>
                  <span className="text-2xl" aria-hidden>
                    {row.meta.icon}
                  </span>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-semibold text-slate-100 truncate">{row.meta.label}</p>
                    <p className="text-xs text-dim">{row.insight}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-slate-100">{formatCurrency(row.total)}</p>
                    <p className="text-xs text-emerald-400/90">{row.share.toFixed(1)}%</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CategoryInsightsPanel
              title="Expense breakdown"
              subtitle="Tap a row for detail"
              icon="📉"
              categories={
                focusCategory
                  ? bundle.expenseCategories.filter((c) => c._id === focusCategory)
                  : bundle.expenseCategories
              }
              totalAmount={raw.totalExpenses}
              totalLabel="total spent"
              showIncomePct
              emptyMessage="No expenses in this period"
            />
            <CategoryInsightsPanel
              title="Income sources"
              icon="💰"
              categories={bundle.incomeCategories}
              totalAmount={raw.totalIncome}
              totalLabel="total income"
              emptyMessage="No income logged — add salary or other inflows"
            />
          </div>

          <div className="card">
            <h3 className="section-title mb-2">What to maintain & improve</h3>
            <p className="text-dim text-sm mb-4">Action plan based on your period data</p>
            <div className="insights-maintain-grid">
              {bundle.maintenance.map((item, i) => (
                <div
                  key={`${item.title}-${i}`}
                  className={`insights-maintain-card insights-maintain-${item.priority}`}
                >
                  <p className="text-xs uppercase tracking-wide opacity-70">{item.priority}</p>
                  <p className="font-bold text-slate-100 mt-1">{item.title}</p>
                  <p className="text-sm text-dim mt-2 leading-relaxed">{item.detail}</p>
                </div>
              ))}
              {bundle.maintenance.length === 0 && (
                <p className="text-dim text-sm col-span-full text-center py-6">
                  No urgent flags — keep logging entries for sharper suggestions.
                </p>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="section-title mb-4">Smart suggestions</h3>
            <ul className="insights-suggestions-list space-y-3">
              {bundle.suggestions.map((s, i) => (
                <li key={`${s.title}-${i}`} className={`insights-suggestion insights-suggestion-${s.type}`}>
                  <span className="text-xl shrink-0" aria-hidden>
                    {s.icon}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-100">{s.title}</p>
                    <p className="text-sm text-dim mt-1">{s.message}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-3 justify-center pb-4">
            <Link to="/tracker" className="btn-primary !px-6">
              Add transaction
            </Link>
            <Link to="/tracker" state={{ view: "reports" }} className="btn-secondary !px-6">
              Monthly tracker
            </Link>
          </div>
        </>
      )}

      {!raw && !loadError && !loading && (
        <div className="empty-state card">
          <p className="text-5xl mb-3">📈</p>
          <h3 className="section-title">No data for this period</h3>
          <p className="text-muted text-sm mt-2">Log income and expenses to unlock insights.</p>
        </div>
      )}
    </div>
  );
}