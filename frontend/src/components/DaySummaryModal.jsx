import { useEffect, useState } from "react";
import api from "../api/api";
import Modal from "./ui/Modal";
import Badge from "./ui/Badge";
import { formatCurrency, formatDate, formatTime } from "../utils/format";
import { sortEntriesByRecent } from "../utils/debt";
import { getCategoryMeta } from "../constants/categories";

export default function DaySummaryModal({ open, onClose, date, onUpdate, onEdit }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !date) return;
    setDetail(null);
    loadDay();
  }, [open, date]);

  const loadDay = async () => {
    setLoading(true);
    setDetail(null);
    try {
      const res = await api.get(`/personal/summary/day?date=${date}`);
      setDetail(res.data);
    } catch (err) {
      console.error("Failed to load day detail", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await api.delete(`/personal/entries/${id}`);
      loadDay();
      onUpdate();
    } catch {
      alert("Failed to delete entry");
    }
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title={date ? formatDate(date) : "Day Summary"} size="lg">
      {loading ? (
        <div className="text-center py-12 text-muted">Loading...</div>
      ) : !detail || detail.entries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-muted">No entries for this day</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 day-summary-stats">
            {[
              { label: "Income", value: detail.totalIncome, color: "from-emerald-500/20 to-teal-500/10", text: "text-emerald-400" },
              { label: "Spent", value: detail.totalExpenses, color: "from-red-500/20 to-rose-500/10", text: "text-red-400" },
              { label: "Net", value: detail.net, color: "from-cyan-500/20 to-violet-500/10", text: detail.net >= 0 ? "text-cyan-400" : "text-amber-400" },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl p-4 text-center bg-gradient-to-br ${s.color} border border-white/8`}>
                <p className="text-xs text-muted mb-1">{s.label}</p>
                <p className={`text-lg font-bold ${s.text}`} style={{ fontFamily: "Outfit, sans-serif" }}>
                  {formatCurrency(s.value)}
                </p>
              </div>
            ))}
          </div>

          {Object.keys(detail.byCategory).length > 0 && (
            <div>
              <h3 className="section-title text-base mb-3">Spending by Category</h3>
              <div className="space-y-3">
                {Object.entries(detail.byCategory).map(([cat, data]) => {
                  const meta = getCategoryMeta(cat);
                  const pct = detail.totalExpenses > 0 ? (data.total / detail.totalExpenses) * 100 : 0;
                  return (
                    <div key={cat} className="flex items-center gap-3">
                      <span className="icon-box text-lg">{meta.icon}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-slate-300">{meta.label}</span>
                          <span className="text-muted">{formatCurrency(data.total)}</span>
                        </div>
                        <div className="progress-track h-1.5">
                          <div className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h3 className="section-title text-base mb-3">All Transactions</h3>
            <div className="space-y-1">
              {sortEntriesByRecent(detail.entries).map((entry) => (
                <div key={entry._id} className="list-item group !py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="icon-box">{getCategoryMeta(entry.category).icon}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge category={entry.category} />
                        <span className="text-xs text-dim tabular-nums">
                          {formatTime(entry.date)}
                        </span>
                        {entry.type === "income" && (
                          <span className="text-xs text-emerald-400 font-medium">Income</span>
                        )}
                      </div>
                      {entry.message && (
                        <p className="text-sm text-muted truncate mt-0.5">{entry.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${entry.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                      {entry.type === "income" ? "+" : "−"}
                      {formatCurrency(entry.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onEdit?.(entry)}
                      className="hover-action-btn sm:opacity-0 sm:group-hover:opacity-100 text-muted hover:text-cyan-400 transition p-1"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(entry._id)}
                      className="hover-action-btn sm:opacity-0 sm:group-hover:opacity-100 text-muted hover:text-red-400 transition p-1"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
