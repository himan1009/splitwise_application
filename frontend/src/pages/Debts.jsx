import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../utils/format";
import DebtBalanceRow from "../components/DebtBalanceRow";
import PageLoader from "../components/ui/PageLoader";
import { isSameUser, summarizeDebtsByPerson, getRecentDebtsByDate, formatDebtTime } from "../utils/debt";
import { getStoredUserId } from "../utils/auth";

import { getApiErrorMessage } from "../utils/apiErrors";

export default function Debts() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const navigate = useNavigate();
  const myId = getStoredUserId();

  useEffect(() => {
    loadDebts();
  }, []);

  const loadDebts = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await api.get("/debts");
      setDebts(res.data);
    } catch (err) {
      console.error("Failed to load debts", err);
      setDebts([]);
      setLoadError(getApiErrorMessage(err, "Could not load debts. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLoader message="Loading debts..." />;
  }

  const personalSummary = summarizeDebtsByPerson(debts, myId);
  const activeDebts = personalSummary.filter((p) => Math.abs(p.amount) >= 0.01);
  const settledDebts = personalSummary.filter((p) => Math.abs(p.amount) < 0.01);

  const totalOwed = activeDebts
    .filter((p) => p.amount > 0)
    .reduce((s, p) => s + p.amount, 0);
  const totalOwing = activeDebts
    .filter((p) => p.amount < 0)
    .reduce((s, p) => s + Math.abs(p.amount), 0);

  const recentByDate = getRecentDebtsByDate(debts, 12);

  return (
    <div className="page-container space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Personal Debts</h1>
          <p className="page-subtitle">Track money lent to or borrowed from friends</p>
        </div>
        <button onClick={() => navigate("/add-debt")} className="btn-success !py-3 !px-6">
          + Add Debt
        </button>
      </div>

      {loadError && (
        <div className="card !p-4 border border-red-500/25 bg-red-500/10 text-red-300 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span>{loadError}</span>
          <button type="button" onClick={loadDebts} className="btn-ghost !text-red-300 shrink-0">
            Retry
          </button>
        </div>
      )}

      <div className="detail-hero detail-hero-indigo">
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wide">You're owed</p>
            <p className="text-2xl font-bold text-emerald-300 mt-1" style={{ fontFamily: "Outfit, sans-serif" }}>
              {formatCurrency(totalOwed)}
            </p>
          </div>
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wide">You owe</p>
            <p className="text-2xl font-bold text-rose-300 mt-1" style={{ fontFamily: "Outfit, sans-serif" }}>
              {formatCurrency(totalOwing)}
            </p>
          </div>
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wide">People</p>
            <p className="text-2xl font-bold text-white mt-1" style={{ fontFamily: "Outfit, sans-serif" }}>
              {personalSummary.length}
            </p>
          </div>
        </div>
      </div>

      {activeDebts.length > 0 && (
        <div className="card">
          <h2 className="section-title mb-5 flex items-center gap-2">
            <span>🤝</span> Active Balances
          </h2>
          <div className="space-y-3">
            {activeDebts.map((p) => (
              <DebtBalanceRow
                key={p._id}
                name={p.name}
                amount={p.amount}
                onClick={() => navigate(`/debt/${p._id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {settledDebts.length > 0 && (
        <div className="card">
          <h2 className="section-title mb-2 flex items-center gap-2">
            <span>✅</span> Settled — View History
          </h2>
          <p className="text-sm text-dim mb-5">
            These people are fully settled. Tap to see full loan & payment history.
          </p>
          <div className="space-y-3">
            {settledDebts.map((p) => (
              <button
                key={p._id}
                type="button"
                onClick={() => navigate(`/debt/${p._id}`)}
                className="debt-balance-row debt-balance-row-settled debt-balance-row-clickable w-full"
              >
                <div className="debt-balance-person">
                  <div className="debt-balance-avatar app-avatar">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="debt-balance-name">{p.name}</p>
                    <p className="debt-balance-status">Settled up · {p.txCount} transactions</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-cyan-400">View history →</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {personalSummary.length === 0 && !loadError && (
        <div className="card">
          <div className="text-center py-10">
            <p className="text-4xl mb-3">🤝</p>
            <p className="text-muted font-semibold">No personal debts yet</p>
            <p className="text-sm text-dim mt-1">Record when you lend or borrow money outside groups</p>
            <button onClick={() => navigate("/add-debt")} className="btn-success mt-6">
              Add your first debt
            </button>
          </div>
        </div>
      )}

      {recentByDate.length > 0 && (
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-1">
            <h2 className="section-title flex items-center gap-2">
              <span>📜</span> Recent Activity
            </h2>
            <span className="text-xs text-dim font-medium">Newest first · by time</span>
          </div>
          <div className="space-y-5">
            {recentByDate.map(({ date, label, entries }) => (
              <div key={date}>
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/8">
                  <p className="text-sm font-bold text-cyan-400/90">{label}</p>
                  <p className="text-xs text-dim">
                    {entries.length} item{entries.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="space-y-3">
                  {entries.map((d) => {
                    const other = isSameUser(d.from, myId) ? d.to : d.from;
                    const isSettlement = d.type === "settlement";
                    const iReceived = isSameUser(d.to, myId);
                    const when = d.recordedAt || d.createdAt;

                    return (
                      <div
                        key={d._id}
                        onClick={() => navigate(`/debt/${other._id}`)}
                        className="history-entry cursor-pointer"
                      >
                        <div className="flex justify-between items-start gap-3 history-entry-row">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-cyan-400/80 tabular-nums">
                                {formatDebtTime(when)}
                              </span>
                              <p className="font-semibold text-slate-200 truncate">
                                {d.description || "Personal debt"}
                              </p>
                              {isSettlement && (
                                <span className="text-xs text-cyan-400">(settlement)</span>
                              )}
                            </div>
                            <p className="text-sm text-muted mt-0.5">
                              with {other.name} ·{" "}
                              {isSettlement
                                ? iReceived
                                  ? d.settledBy?.name
                                    ? `payment received · recorded by ${d.settledBy.name}`
                                    : "payment received"
                                  : d.settledBy?.name
                                  ? `payment sent · recorded by ${d.settledBy.name}`
                                  : "payment sent"
                                : iReceived
                                ? "you lent"
                                : "you borrowed"}
                            </p>
                          </div>
                          <p
                            className={`font-bold shrink-0 ${
                              isSettlement
                                ? "text-cyan-400"
                                : iReceived
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {isSettlement ? "" : iReceived ? "+" : "−"}
                            {formatCurrency(d.amount)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
