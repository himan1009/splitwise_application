import { formatCurrency } from "../utils/format";
import { getCategoryBarTone } from "../utils/categoryAnalytics";

function CategoryRow({ cat, showIncomePct = false, onClick }) {
  const pct = cat.type === "income" ? cat.pctOfIncome : cat.pctOfExpenses;
  const tone = getCategoryBarTone(cat);
  const barClass =
    tone === "income"
      ? "category-bar-income"
      : tone === "discretionary"
      ? "category-bar-discretionary"
      : tone === "essential"
      ? "category-bar-essential"
      : "category-bar-default";

  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick ? () => onClick(cat) : undefined}
      className={`category-insight-row ${onClick ? "category-insight-row-clickable" : ""}`}
    >
      <div className="category-insight-header">
        <div className="category-insight-label">
          <span className="category-insight-icon" aria-hidden>
            {cat.meta.icon}
          </span>
          <div className="min-w-0">
            <p className="category-insight-name">{cat.meta.label}</p>
            <p className="category-insight-meta">
              {cat.count} transaction{cat.count !== 1 ? "s" : ""}
              {cat.avgTxn > 0 && ` · avg ${formatCurrency(cat.avgTxn)}`}
              {cat.maxTxn > 0 && cat.maxTxn !== cat.avgTxn && ` · max ${formatCurrency(cat.maxTxn)}`}
            </p>
          </div>
        </div>
        <div className="category-insight-amounts shrink-0 text-right">
          <p className={`category-insight-total ${cat.type === "income" ? "text-emerald-400" : "text-slate-200"}`}>
            {formatCurrency(cat.total)}
          </p>
          <p className="category-insight-pct">
            {pct.toFixed(1)}% of {cat.type === "income" ? "income" : "spend"}
            {showIncomePct && cat.type === "expense" && cat.pctOfIncome > 0 && (
              <span className="text-dim"> · {cat.pctOfIncome.toFixed(0)}% of income</span>
            )}
          </p>
        </div>
      </div>
      <div className="progress-track h-2.5 mt-3">
        <div className={`h-full rounded-full ${barClass}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      {cat.isDiscretionary && cat.pctOfIncome >= 15 && (
        <p className="category-insight-flag mt-2">High vs income — consider a monthly cap</p>
      )}
    </Wrapper>
  );
}

export default function CategoryInsightsPanel({
  title,
  subtitle,
  icon = "🏷️",
  categories = [],
  totalAmount = 0,
  totalLabel = "Total",
  emptyMessage = "No data yet",
  showIncomePct = false,
  onCategoryClick,
}) {
  if (!categories.length) {
    return (
      <div className="card">
        {title && (
          <h3 className="section-title mb-4 flex items-center gap-2">
            <span>{icon}</span> {title}
          </h3>
        )}
        <p className="text-dim text-sm text-center py-8">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
        <div className="min-w-0">
          <h3 className="section-title flex items-center gap-2">
            <span>{icon}</span> {title}
          </h3>
          {subtitle && <p className="text-sm text-dim mt-1">{subtitle}</p>}
        </div>
        <div className="category-insight-total-pill shrink-0">
          <span className="text-xs text-dim">{totalLabel}</span>
          <span className="font-bold text-lg text-cyan-400">{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      <div className="space-y-4">
        {categories.map((cat) => (
          <CategoryRow
            key={cat._id}
            cat={cat}
            showIncomePct={showIncomePct}
            onClick={onCategoryClick}
          />
        ))}
      </div>
    </div>
  );
}
