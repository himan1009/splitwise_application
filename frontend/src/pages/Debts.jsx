import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../utils/format";
import DebtBalanceRow from "../components/DebtBalanceRow";
import PageLoader from "../components/ui/PageLoader";
import { isSameUser, summarizeDebtsByPerson, getRecentDebtsByDate, formatDebtTime, formatDebtEntrySign, getDebtEntryCashDelta } from "../utils/debt";
import { getStoredUserId } from "../utils/auth";

import { getApiErrorMessage } from "../utils/apiErrors";
import SecurityNotice from "../components/SecurityNotice";

export default function Debts() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [balanceFilter, setBalanceFilter] = useState("all");
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

  const { personalSummary, activeDebts, settledDebts, totalOwed, totalOwing, netPosition, recentByDate } =
    useMemo(() => {
      const summary = summarizeDebtsByPerson(debts, myId);
      const active = summary.filter((p) => Math.abs(p.amount) >= 0.01);
      const settled = summary.filter((p) => Math.abs(p.amount) < 0.01);
      const owed = active.filter((p) => p.amount > 0).reduce((s, p) => s + p.amount, 0);
      const owing = active.filter((p) => p.amount < 0).reduce((s, p) => s + Math.abs(p.amount), 0);
      return {
        personalSummary: summary,
        activeDebts: active,
        settledDebts: settled,
        totalOwed: owed,
        totalOwing: owing,
        netPosition: owed - owing,
        recentByDate: getRecentDebtsByDate(debts, 12),
      };
    }, [debts, myId]);

  const filteredActive = useMemo(() => {
    const q = search.trim().toLowerCase();
    return activeDebts.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (balanceFilter === "owed" && p.amount <= 0) return false;
      if (balanceFilter === "owe" && p.amount >= 0) return false;
      if (balanceFilter === "settled") return false;
      return true;
    });
  }, [activeDebts, search, balanceFilter]);

  const filteredSettled = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (balanceFilter === "owed" || balanceFilter === "owe") return [];
    return settledDebts.filter((p) => !q || p.name.toLowerCase().includes(q));
  }, [settledDebts, search, balanceFilter]);

  if (loading) {
    return <PageLoader message="Loading debts..." />;
  }

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

      <div className="card !p-3 flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          className="input !py-2.5 flex-1"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "All" },
            { id: "owed", label: "Owed to me" },
            { id: "owe", label: "I owe" },
            { id: "settled", label: "Settled" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              className={balanceFilter === f.id ? "txn-chip txn-chip-active" : "txn-chip"}
              onClick={() => setBalanceFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="detail-hero detail-hero-indigo">
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-4 gap-4">
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
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wide">Net position</p>
            <p
              className={`text-2xl font-bold mt-1 ${
                netPosition >= 0 ? "text-emerald-300" : "text-rose-300"
              }`}
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              {netPosition >= 0 ? "+" : "−"}
              {formatCurrency(Math.abs(netPosition))}
            </p>
          </div>
        </div>
      </div>

      <SecurityNotice />

      {filteredActive.length > 0 && balanceFilter !== "settled" && (
        <div className="card">
          <h2 className="section-title mb-5">Active balances</h2>
          <div className="space-y-3">
            {filteredActive.map((p) => (
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

      {filteredSettled.length > 0 && (
        <div className="card">
          <h2 className="section-title mb-2">Settled</h2>
          <p className="text-sm text-dim mb-5">
            These people are fully settled. Tap to see full loan & payment history.
          </p>
          <div className="space-y-3">
            {filteredSettled.map((p) => (
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
                <span className="text-xs font-semibold text-emerald-400">View history</span>
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
                    const cashDelta = getDebtEntryCashDelta(d, myId);
                    const when = d.recordedAt || d.createdAt;

                    return (
                      <div
                        key={d._id}
                        onClick={() => navigate(`/debt/${other._id}`)}
                        className="history-entry cursor-pointer"
                      >
                        <div className="flex justify-between items-start gap-3 history-entry-row">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start gap-2 flex-wrap">
                              <span className="text-xs font-bold text-cyan-400/80 tabular-nums shrink-0">
                                {formatDebtTime(when)}
                              </span>
                              <p className="history-entry-title break-words">
                                {d.description || "Personal debt"}
                              </p>
                              {isSettlement && (
                                <span className="text-xs text-cyan-400 shrink-0">(settlement)</span>
                              )}
                            </div>
                            <p className="text-sm text-muted mt-0.5 break-words">
                              with {other.name} ·{" "}
                              {isSettlement
                                ? isSameUser(d.to, myId)
                                  ? d.recordedBy?.name || d.settledBy?.name
                                    ? `payment received · recorded by ${(d.recordedBy || d.settledBy)?.name}`
                                    : "payment received"
                                  : d.recordedBy?.name || d.settledBy?.name
                                  ? `payment sent · recorded by ${(d.recordedBy || d.settledBy)?.name}`
                                  : "payment sent"
                                : cashDelta < 0
                                ? "you lent"
                                : "you borrowed"}
                            </p>
                          </div>
                          <p
                            className={`font-bold shrink-0 ${
                              cashDelta >= 0 ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            {formatDebtEntrySign(cashDelta)}
                            {formatCurrency(Math.abs(cashDelta))}
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
