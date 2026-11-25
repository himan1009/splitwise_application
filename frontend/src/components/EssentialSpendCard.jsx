import { formatCurrency } from "../utils/format";
import { summarizeEssentialSpend } from "../utils/essentialSummary";

export default function EssentialSpendCard({ byCategory = [], totalExpenses = 0, title = "Needs vs lifestyle" }) {
  const s = summarizeEssentialSpend(byCategory, totalExpenses);

  if (totalExpenses <= 0) return null;

  return (
    <div className="card essential-spend-card">
      <h3 className="section-title mb-1">{title}</h3>
      <p className="text-dim text-sm mb-4">{s.tip}</p>
      <div className="essential-spend-bars">
        <div className="essential-spend-track">
          <div className="essential-spend-fill essential" style={{ width: `${s.essentialPct}%` }} />
          <div className="essential-spend-fill discretionary" style={{ width: `${s.discretionaryPct}%` }} />
          <div
            className="essential-spend-fill other"
            style={{ width: `${100 - s.essentialPct - s.discretionaryPct}%` }}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
        <div>
          <p className="text-xs text-dim">Essentials</p>
          <p className="font-bold text-emerald-400 text-sm">{formatCurrency(s.essential)}</p>
          <p className="text-[0.65rem] text-dim">{s.essentialPct.toFixed(0)}%</p>
        </div>
        <div>
          <p className="text-xs text-dim">Lifestyle</p>
          <p className="font-bold text-amber-400 text-sm">{formatCurrency(s.discretionary)}</p>
          <p className="text-[0.65rem] text-dim">{s.discretionaryPct.toFixed(0)}%</p>
        </div>
        <div>
          <p className="text-xs text-dim">Other</p>
          <p className="font-bold text-slate-300 text-sm">{formatCurrency(s.other)}</p>
        </div>
      </div>
    </div>
  );
}