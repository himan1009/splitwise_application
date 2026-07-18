import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import AddExpense from "./AddExpense";
import DebtBalanceRow from "../components/DebtBalanceRow";
import GroupSettlePanel from "../components/GroupSettlePanel";
import PersonSelectList from "../components/PersonSelectList";
import PageLoader from "../components/ui/PageLoader";
import { formatCurrency, formatDateTime } from "../utils/format";
import { isSameUser, normalizeId } from "../utils/debt";
import { getStoredUser, getStoredUserId } from "../utils/auth";
import { getApiErrorMessage } from "../utils/apiErrors";

function filterExpensesForUser(expenses, myId) {
  const me = normalizeId(myId);
  return expenses.filter((exp) => {
    if (isSameUser(exp.paidBy, me)) return true;
    return exp.splits.some((s) => isSameUser(s.user, me));
  });
}

function getSummary(expenses, members, myId) {
  const me = normalizeId(myId);
  const summaryMap = {};

  members.forEach((m) => {
    if (!isSameUser(m._id, me)) summaryMap[normalizeId(m._id)] = 0;
  });

  expenses.forEach((exp) => {
    const payerId = normalizeId(exp.paidBy);

    exp.splits.forEach((split) => {
      const uid = normalizeId(split.user);
      const amt = Number(split.amount);

      if (payerId === me && uid !== me) {
        summaryMap[uid] += amt;
      }

      if (payerId !== me && uid === me) {
        summaryMap[payerId] -= amt;
      }
    });
  });

  const summary = [];

  members.forEach((m) => {
    if (isSameUser(m._id, me)) return;

    const val = summaryMap[normalizeId(m._id)];

    if (val > 0.01) {
      summary.push({
        userId: normalizeId(m._id),
        name: m.name,
        net: val,
        amount: val,
        type: "get",
      });
    }

    if (val < -0.01) {
      summary.push({
        userId: normalizeId(m._id),
        name: m.name,
        net: val,
        amount: Math.abs(val),
        type: "owe",
      });
    }
  });

  return summary;
}

export default function GroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const user = getStoredUser();
  const myId = getStoredUserId();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [settlingWith, setSettlingWith] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [addingMembers, setAddingMembers] = useState(false);

  useEffect(() => {
    loadAll();
  }, [groupId]);

  const loadAll = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const groupsRes = await api.get("/groups");
      const g = groupsRes.data.find((x) => x._id === groupId);
      setGroup(g || null);

      if (g) {
        const [expRes, usersRes] = await Promise.all([
          api.get(`/expenses/${groupId}`),
          api.get(`/groups/${groupId}/available-users`),
        ]);
        setExpenses(expRes.data);
        setAvailableUsers(usersRes.data);
      }
    } catch (err) {
      console.error("Failed to load group", err);
      setGroup(null);
      setExpenses([]);
      setLoadError(getApiErrorMessage(err, "Could not load this group. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const addMembers = async () => {
    if (selectedUsers.length === 0) return;

    setAddingMembers(true);
    try {
      for (const id of selectedUsers) {
        await api.post(`/groups/${groupId}/add-member`, { userId: id });
      }
      setSelectedUsers([]);
      await loadAll();
    } catch (err) {
      console.error("Failed to add members", err);
      alert("Failed to add members");
    } finally {
      setAddingMembers(false);
    }
  };

  const deleteGroup = async () => {
    if (!window.confirm("Delete this group permanently?")) return;
    try {
      await api.delete(`/groups/${groupId}`);
      navigate("/groups");
    } catch (err) {
      console.error("Failed to delete group", err);
      alert(err.response?.data?.message || "Failed to delete group");
    }
  };

  if (loading) {
    return <PageLoader message="Loading group..." />;
  }

  if (!group) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <p className="text-4xl mb-3">{loadError ? "⚠️" : "🔍"}</p>
          <p className="text-muted font-semibold">
            {loadError ? "Could not load group" : "Group not found"}
          </p>
          {loadError && (
            <p className="text-sm text-dim mt-2 max-w-sm mx-auto">{loadError}</p>
          )}
          <button type="button" onClick={() => (loadError ? loadAll() : navigate("/groups"))} className="btn-primary mt-6">
            {loadError ? "Retry" : "Back to Groups"}
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = isSameUser(group.createdBy, myId);
  const visibleExpenses = filterExpensesForUser(expenses, myId);
  const summary = getSummary(visibleExpenses, group.members, myId);
  const activeSettle = settlingWith
    ? summary.find((s) => s.userId === settlingWith && s.net < 0)
    : null;
  const owesYou = summary.filter((s) => s.net > 0);
  const youOwe = summary.filter((s) => s.net < 0);

  const handleSettled = async () => {
    setSettlingWith(null);
    await loadAll();
  };

  return (
    <div className="page-container space-y-6">
      <button type="button" onClick={() => navigate("/groups")} className="back-link">
        ← Back to Groups
      </button>

      <div className="detail-hero detail-hero-indigo">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-white/60 text-sm font-medium">Group</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
              {group.name}
            </h1>
            <p className="text-white/50 text-sm mt-1">{group.members.length} members</p>
          </div>
          {summary.length === 0 ? (
            <span className="badge-green !text-sm">🎉 All settled</span>
          ) : (
            <div className="w-full sm:w-auto space-y-3">
              {youOwe.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-white/50 text-center sm:text-right">
                    Tap to record your payment
                  </p>
                  <div className="group-balance-list">
                    {youOwe.map((s) => (
                      <DebtBalanceRow
                        key={s.userId}
                        name={s.name}
                        amount={s.net}
                        compact
                        onClick={() => setSettlingWith(s.userId)}
                      />
                    ))}
                  </div>
                </div>
              )}
              {owesYou.length > 0 && (
                <div className="space-y-2">
                  {youOwe.length > 0 && (
                    <p className="text-xs text-white/40 text-center sm:text-right">—</p>
                  )}
                  <p className="text-xs text-emerald-400/70 text-center sm:text-right">
                    Waiting for them to pay you
                  </p>
                  <div className="group-balance-list">
                    {owesYou.map((s) => (
                      <DebtBalanceRow
                        key={s.userId}
                        name={s.name}
                        amount={s.net}
                        compact
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {activeSettle && (
        <GroupSettlePanel
          groupId={groupId}
          otherUserId={activeSettle.userId}
          otherUserName={activeSettle.name}
          net={activeSettle.net}
          onSettled={handleSettled}
          onCancel={() => setSettlingWith(null)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AddExpense
            group={group}
            onAdd={loadAll}
            editingExpense={editingExpense}
            onCancelEdit={() => setEditingExpense(null)}
          />

          <div className="card">
            <h3 className="section-title mb-5 flex items-center gap-2">
              <span>📜</span> Expense History
            </h3>

            {visibleExpenses.length === 0 ? (
              <div className="empty-state !py-12">
                <p className="text-4xl mb-3">💸</p>
                <p className="text-muted font-semibold">No expenses yet</p>
                <p className="text-sm text-dim mt-1">Add your first group expense above</p>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleExpenses.map((e) => {
                  const isSettlement = e.type === "settlement";

                  return (
                  <div
                    key={e._id}
                    className={`history-entry group ${isSettlement ? "history-entry-settlement" : ""}`}
                  >
                    <div className="flex justify-between items-start gap-3 history-entry-row">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-200">{e.description}</p>
                          {isSettlement && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                              Settlement
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted mt-1">
                          Paid by <span className="text-cyan-400/90">{e.paidBy.name}</span>
                        </p>
                      </div>
                      <div className="flex items-start gap-2 shrink-0">
                        <p className="font-bold text-lg text-slate-100">
                          {formatCurrency(e.amount)}
                        </p>
                        {!isSettlement && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingExpense(e);
                            document.getElementById("add-expense-form")?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          }}
                          className="hover-action-btn sm:opacity-0 sm:group-hover:opacity-100 text-muted hover:text-cyan-400 transition p-1"
                          title="Edit expense"
                        >
                          ✏️
                        </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {e.splits.map((s, i) => (
                        <span
                          key={i}
                          className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400"
                        >
                          {s.user.name}: {formatCurrency(s.amount)}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-dim mt-2 tabular-nums">
                      {formatDateTime(e.recordedAt || e.createdAt)}
                    </p>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="section-title mb-4 flex items-center gap-2">
              <span>👥</span> Members
            </h3>
            <div className="member-grid">
              {group.members.map((m) => (
                <div key={m._id} className="member-card">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="app-avatar !w-9 !h-9 !text-sm shrink-0">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-200 text-sm truncate">{m.name}</p>
                      <p className="text-xs text-dim truncate">{m.email}</p>
                    </div>
                  </div>
                  {isSameUser(group.createdBy, m._id) && (
                    <span className="text-xs bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 font-semibold px-2 py-0.5 rounded-full shrink-0">
                      Admin
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="section-title mb-4">Add Members</h3>
            {availableUsers.length === 0 ? (
              <p className="text-sm text-dim">No more users available to add</p>
            ) : (
              <>
                <PersonSelectList
                  users={availableUsers}
                  value={selectedUsers}
                  onChange={setSelectedUsers}
                  multiple
                  maxHeight="12rem"
                  emptyMessage="No users available"
                />
                <button
                  type="button"
                  onClick={addMembers}
                  disabled={selectedUsers.length === 0 || addingMembers}
                  className="btn-primary w-full mt-4 !py-2.5"
                >
                  {addingMembers
                    ? "Adding..."
                    : `Add Selected (${selectedUsers.length})`}
                </button>
              </>
            )}
          </div>

          {isAdmin && (
            <div className="danger-zone">
              <h3 className="text-red-400 font-semibold mb-2 text-sm">Admin Controls</h3>
              <p className="text-xs text-dim mb-3">
                Permanently delete this group and all its expenses.
              </p>
              <button type="button" onClick={deleteGroup} className="btn-danger w-full">
                Delete Group
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
