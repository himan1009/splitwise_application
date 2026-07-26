import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import { formatCurrency, formatDate } from "../utils/format";
import {
  calculateDebtNet,
  canDeleteDebtEntry,
  canEditDebtEntry,
  canModifyDebtEntry,
  formatDebtEntrySign,
  getDebtEntryCashDelta,
  getDebtEntryMeta,
  groupDebtsByDate,
  isSameUser,
  formatDebtTime,
} from "../utils/debt";
import BalanceFlowHero from "../components/BalanceFlowHero";
import SettleDebtPanel from "../components/SettleDebtPanel";
import EditDebtModal from "../components/EditDebtModal";
import PageLoader from "../components/ui/PageLoader";
import { getStoredUserId } from "../utils/auth";

export default function DebtDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const myId = getStoredUserId();

  const [history, setHistory] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [editingDebt, setEditingDebt] = useState(null);

  useEffect(() => {
    setHistory([]);
    setOtherUser(null);
    setLoadError("");
    loadOtherUser();
    loadHistory(true);
  }, [userId]);

  const loadOtherUser = async () => {
    try {
      const res = await api.get("/groups/users");
      const found = res.data.find((u) => isSameUser(u._id, userId));
      if (found) {
        setOtherUser(found);
      }
    } catch (err) {
      console.error("Failed to load user profile", err);
    }
  };

  const loadHistory = async (initial = false) => {
    if (initial) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const res = await api.get(`/debts/with/${userId}`);
      setHistory(res.data);
      setLoadError("");

      if (res.data.length > 0) {
        const first = res.data[0];
        const other = isSameUser(first.from, myId) ? first.to : first.from;
        setOtherUser(other);
      }
    } catch (err) {
      console.error("Failed to load debt history", err);
      setHistory([]);
      setLoadError("Could not load debt history. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const net = calculateDebtNet(history, myId);
  const dateGroups = groupDebtsByDate(history);
  const myRecordedCount = history.filter((d) => canModifyDebtEntry(d, myId)).length;

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await api.delete(`/debts/${id}`);
      loadHistory();
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.response?.data?.message || "Failed to delete transaction");
    }
  };

  const handleDeleteMine = async () => {
    if (
      !window.confirm(
        `Delete only the ${myRecordedCount} entr${myRecordedCount === 1 ? "y" : "ies"} you recorded with this person? Entries they recorded will stay.`
      )
    ) {
      return;
    }
    try {
      const res = await api.delete(`/debts/all-with/${userId}`);
      if (res.data?.deletedCount === 0) {
        alert("You have no entries you recorded with this person.");
        return;
      }
      loadHistory();
    } catch (err) {
      console.error("Delete mine error:", err);
      alert(err.response?.data?.message || "Failed to delete your entries");
    }
  };

  const loanTotal = history
    .filter((d) => d.type !== "settlement")
    .reduce((sum, d) => {
      if (isSameUser(d.to, myId)) return sum + Number(d.amount);
      return sum - Number(d.amount);
    }, 0);

  const settledTotal = history
    .filter((d) => d.type === "settlement")
    .reduce((sum, d) => sum + Number(d.amount), 0);

  if (loading) {
    return <PageLoader message="Loading history..." />;
  }

  return (
    <div className="page-container space-y-6">
      <button type="button" onClick={() => navigate("/debts")} className="back-link">
        ← Back to Debts
      </button>

      {loadError && (
        <div className="card !p-4 border border-red-500/25 bg-red-500/10 text-red-300 text-sm">
          {loadError}
        </div>
      )}

      {otherUser ? (
        <>
          <div className="flex items-center gap-3 mb-1 min-w-0">
            <div className="app-avatar !w-12 !h-12 !text-lg shrink-0">
              {otherUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="page-title text-xl sm:text-2xl break-words">{otherUser.name}</h1>
              <p className="text-sm text-dim truncate">{otherUser.email}</p>
              {history.length > 0 && (
                <p className="text-xs text-cyan-400/80 mt-0.5 font-medium">
                  {history.length} total transaction{history.length !== 1 ? "s" : ""} on record
                </p>
              )}
            </div>
          </div>

          <BalanceFlowHero otherName={otherUser.name} net={net} />

          <SettleDebtPanel
            otherUserId={userId}
            otherUserName={otherUser.name}
            net={net}
            onSettled={() => loadHistory()}
          />

          <p className="text-xs text-dim text-center -mt-2">
            Shared ledger — either person can record a payment. Only the person who added an entry can edit or delete it.
          </p>
        </>
      ) : (
        <div className="card !p-4 text-sm text-muted">Could not load contact details.</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="metric-card" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
          <p className="metric-label">Outstanding</p>
          <p className="metric-value text-lg sm:text-xl">
            {Math.abs(net) < 0.01 ? "Settled" : formatCurrency(Math.abs(net))}
          </p>
        </div>
        <div className="metric-card" style={{ background: "linear-gradient(135deg, #10b981, #14b8a6)" }}>
          <p className="metric-label">Net loan position</p>
          <p className="metric-value text-lg sm:text-xl">
            {formatCurrency(Math.abs(loanTotal))}
          </p>
        </div>
        <div className="metric-card" style={{ background: "linear-gradient(135deg, #0891b2, #06b6d4)" }}>
          <p className="metric-label">Payments recorded</p>
          <p className="metric-value text-lg sm:text-xl">{formatCurrency(settledTotal)}</p>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <h2 className="section-title flex items-center gap-2">
            <span>📅</span> Day-by-day History
            {refreshing && <span className="text-xs text-dim font-normal">Updating...</span>}
          </h2>
          {myRecordedCount > 0 && (
            <button
              type="button"
              onClick={handleDeleteMine}
              className="btn-ghost !text-red-400 !text-xs min-h-[44px] self-start sm:self-auto"
            >
              Delete my entries ({myRecordedCount})
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="empty-state !py-12">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-muted font-semibold">No transactions yet</p>
            <p className="text-sm text-dim mt-1">Debt records with this person will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {dateGroups.map(({ date, label, entries }) => {
              const dayCashMovement = entries.reduce(
                (sum, d) => sum + getDebtEntryCashDelta(d, myId),
                0
              );

              return (
                <div key={date}>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/8 gap-2">
                    <p className="text-sm font-bold text-cyan-400/90">{label || formatDate(date)}</p>
                    <p className="text-xs text-dim shrink-0">
                      {entries.length} transaction{entries.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {entries.map((d) => {
                      const meta = getDebtEntryMeta(d, myId);
                      const isSettlement = d.type === "settlement";
                      const canEdit = canEditDebtEntry(d, myId);
                      const canDelete = canDeleteDebtEntry(d, myId);

                      return (
                        <div
                          key={d._id}
                          className={`history-entry ${
                            isSettlement ? "history-entry-settlement" : ""
                          }`}
                        >
                          <div className="flex justify-between items-start gap-3 history-entry-row">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start gap-2 flex-wrap">
                                <p className="history-entry-title break-words">
                                  {d.description || "Personal debt"}
                                </p>
                                {isSettlement && (
                                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 shrink-0">
                                    Settlement
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted mt-1 break-words">{meta.label}</p>
                              {meta.recorderName && !meta.recordedByMe && (
                                <p className="text-xs text-cyan-400/70 mt-0.5 break-words">
                                  Recorded by {meta.recorderName}
                                </p>
                              )}
                              {meta.recordedByMe && (
                                <p className="text-xs text-emerald-400/70 mt-0.5">You recorded this</p>
                              )}
                              <p className="text-xs text-dim mt-1">
                                {formatDebtTime(d.recordedAt || d.createdAt)}
                              </p>
                            </div>
                            <div className="text-right shrink-0 flex flex-col items-end gap-1">
                              <p className={`font-bold text-lg ${meta.colorClass}`}>
                                {meta.sign}
                                {formatCurrency(d.amount)}
                              </p>
                              {(canEdit || canDelete) && (
                                <div className="flex items-center gap-1">
                                  {canEdit && (
                                    <button
                                      type="button"
                                      onClick={() => setEditingDebt(d)}
                                      className="history-entry-action text-cyan-400/80 hover:text-cyan-400"
                                    >
                                      Edit
                                    </button>
                                  )}
                                  {canDelete && (
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(d._id)}
                                      className="history-entry-action text-red-400/80 hover:text-red-400"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-xs text-dim mt-2 text-right">
                    Day cash movement:{" "}
                    <span className={dayCashMovement >= 0 ? "text-emerald-400" : "text-red-400"}>
                      {formatDebtEntrySign(dayCashMovement)}
                      {formatCurrency(Math.abs(dayCashMovement))}
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <EditDebtModal
        open={Boolean(editingDebt)}
        debt={editingDebt}
        onClose={() => setEditingDebt(null)}
        onSuccess={() => loadHistory()}
      />
    </div>
  );
}
