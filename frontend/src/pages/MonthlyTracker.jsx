import { useEffect, useState, useCallback } from "react";
import api from "../api/api";
import AddEntryModal from "../components/AddEntryModal";
import DaySummaryModal from "../components/DaySummaryModal";
import MonthlyReports from "../components/MonthlyReports";
import Badge from "../components/ui/Badge";
import PageLoader from "../components/ui/PageLoader";
import {
  formatCurrency,
  formatMonth,
  formatDate,
  formatTime,
  getCurrentMonth,
  getNowDateString,
  shiftMonth,
  getDaysInMonth,
  getFirstDayOfMonth,
  toDateString,
} from "../utils/format";
import { sortEntriesByRecent } from "../utils/debt";
import { getApiErrorMessage } from "../utils/apiErrors";
import { getCategoryMeta } from "../constants/categories";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MonthlyTracker() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [summary, setSummary] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [entries, setEntries] = useState([]);
  const [prevSummary, setPrevSummary] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [addDate, setAddDate] = useState(null);
  const [view, setView] = useState("reports");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const prevMonth = shiftMonth(month, -1);
      const [summaryRes, dailyRes, entriesRes, prevSummaryRes] = await Promise.all([
        api.get(`/personal/summary/monthly?month=${month}`),
        api.get(`/personal/summary/daily?month=${month}`),
        api.get(`/personal/entries?month=${month}`),
        api.get(`/personal/summary/monthly?month=${prevMonth}`).catch(() => ({ data: null })),
      ]);
      setSummary(summaryRes.data);
      setDailyData(dailyRes.data);
      setEntries(entriesRes.data);
      setPrevSummary(prevSummaryRes.data);
    } catch (err) {
      console.error("Failed to load tracker data", err);
      setSummary(null);
      setDailyData([]);
      setEntries([]);
      setPrevSummary(null);
      setLoadError(getApiErrorMessage(err, "Could not load tracker data. Please try again."));
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const dailyMap = {};
  dailyData.forEach((d) => {
    dailyMap[d._id] = d;
  });

  const handleDayClick = (dateStr) => {
    setSelectedDate(dateStr);
  };

  const handleAddForDay = (dateStr) => {
    setEditingEntry(null);
    setAddDate(dateStr);
    setShowAddModal(true);
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setAddDate(null);
    setShowAddModal(true);
    setShowDayModal(false);
  };

  const closeEntryModal = () => {
    setShowAddModal(false);
    setAddDate(null);
    setEditingEntry(null);
  };

  const [year, mon] = month.split("-").map(Number);
  const daysInMonth = getDaysInMonth(month);
  const firstDay = getFirstDayOfMonth(month);

  const calendarCells = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(toDateString(year, mon, d));
  }

  const balance = summary?.balance ?? 0;
  const spentPct =
    summary && summary.totalIncome > 0
      ? Math.min((summary.totalExpenses / summary.totalIncome) * 100, 100)
      : 0;

  if (loading && !summary) {
    return <PageLoader message="Loading tracker..." />;
  }

  return (
    <div className="page-container space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Monthly Tracker</h1>
          <p className="page-subtitle">Track income, expenses & daily spending</p>
        </div>
        <button
          onClick={() => {
            setEditingEntry(null);
            setAddDate(null);
            setShowAddModal(true);
          }}
          className="btn-primary !py-3 !px-6"
        >
          + Add Entry
        </button>
      </div>

      <div className="card !p-3 flex items-center justify-between">
        <button
          onClick={() => setMonth(shiftMonth(month, -1))}
          className="month-nav-btn"
        >
          ←
        </button>
        <h2 className="section-title">{formatMonth(month)}</h2>
        <button
          onClick={() => setMonth(shiftMonth(month, 1))}
          className="month-nav-btn"
        >
          →
        </button>
      </div>

      {loadError && (
        <div className="card !p-4 border border-red-500/25 bg-red-500/10 text-red-300 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span>{loadError}</span>
          <button type="button" onClick={loadData} className="btn-ghost !text-red-300 shrink-0">
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="metric-card" style={{ background: "linear-gradient(135deg, #10b981, #14b8a6)" }}>
          <p className="metric-label">Total Income</p>
          <p className="metric-value">{formatCurrency(summary?.totalIncome ?? 0)}</p>
        </div>
        <div className="metric-card" style={{ background: "linear-gradient(135deg, #f43f5e, #ef4444)" }}>
          <p className="metric-label">Total Spent</p>
          <p className="metric-value">{formatCurrency(summary?.totalExpenses ?? 0)}</p>
        </div>
        <div
          className="metric-card"
          style={{
            background: balance >= 0
              ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
              : "linear-gradient(135deg, #f59e0b, #f97316)",
          }}
        >
          <p className="metric-label">Remaining</p>
          <p className="metric-value">{formatCurrency(balance)}</p>
        </div>
      </div>

      {/* Spending progress */}
      {summary && summary.totalIncome > 0 && (
        <div className="card">
          <div className="flex justify-between text-sm mb-3">
            <span className="font-semibold text-slate-300">Budget used</span>
            <span className="font-bold glow-text">{spentPct.toFixed(0)}% of income</span>
          </div>
          <div className="progress-track h-3">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                spentPct > 90
                  ? "bg-gradient-to-r from-red-500 to-rose-500"
                  : spentPct > 70
                  ? "bg-gradient-to-r from-amber-400 to-orange-500"
                  : "bg-gradient-to-r from-cyan-500 to-violet-500"
              }`}
              style={{ width: `${spentPct}%` }}
            />
          </div>
        </div>
      )}

      {/* View toggle */}
      <div className="view-tabs-wrap">
        {[
          { id: "reports", label: "📊 Reports" },
          { id: "calendar", label: "📅 Calendar" },
          { id: "list", label: "📋 Transactions" },
          { id: "categories", label: "🏷️ Categories" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={view === tab.id ? "view-tab view-tab-active" : "view-tab view-tab-inactive"}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reports view */}
      {view === "reports" && (
        <MonthlyReports
          summary={summary}
          entries={entries}
          dailyData={dailyData}
          month={month}
          prevSummary={prevSummary}
          onDayClick={(dateStr) => {
            setSelectedDate(dateStr);
            setShowDayModal(true);
          }}
        />
      )}

      {/* Calendar view */}
      {view === "calendar" && (
        <div className="card !p-4 sm:!p-5">
          <div className="cal-grid mb-2">
            {WEEKDAYS.map((d) => (
              <div key={d} className="cal-weekday">
                {d}
              </div>
            ))}
          </div>
          <div className="cal-grid">
            {calendarCells.map((dateStr, i) => {
              if (!dateStr) {
                return <div key={`empty-${i}`} className="cal-day-empty" />;
              }
              const day = dailyMap[dateStr];
              const dayNum = parseInt(dateStr.split("-")[2], 10);
              const isToday = dateStr === getNowDateString();
              const hasActivity = day && day.entryCount > 0;
              const isSelected = selectedDate === dateStr;

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => handleDayClick(dateStr)}
                  className={`cal-day group ${
                    isSelected
                      ? "cal-day-selected"
                      : isToday
                      ? "cal-day-today"
                      : hasActivity
                      ? "cal-day-active"
                      : ""
                  }`}
                >
                  <span className="cal-day-num">{dayNum}</span>
                  <div className="cal-day-amounts">
                    {day && day.expenses > 0 && (
                      <span className="cal-day-amount cal-day-amount-expense">
                        −{day.expenses >= 1000 ? `${(day.expenses / 1000).toFixed(1)}k` : day.expenses}
                      </span>
                    )}
                    {day && day.income > 0 && (
                      <span className="cal-day-amount cal-day-amount-income">
                        +{day.income >= 1000 ? `${(day.income / 1000).toFixed(1)}k` : day.income}
                      </span>
                    )}
                  </div>
                  <span
                    className="cal-day-add"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddForDay(dateStr);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddForDay(dateStr);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Add entry for day ${dayNum}`}
                  >
                    +
                  </span>
                </button>
              );
            })}
          </div>

          {selectedDate && (
            <div className="cal-selected-panel">
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "short",
                  })}
                </p>
                <p className="text-xs text-dim mt-0.5">
                  {dailyMap[selectedDate]
                    ? `${dailyMap[selectedDate].entryCount} transaction${
                        dailyMap[selectedDate].entryCount !== 1 ? "s" : ""
                      }`
                    : "No entries yet"}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-sm font-bold flex-wrap justify-end">
                {dailyMap[selectedDate]?.income > 0 && (
                  <span className="text-emerald-400">
                    +{formatCurrency(dailyMap[selectedDate].income)}
                  </span>
                )}
                {dailyMap[selectedDate]?.expenses > 0 && (
                  <span className="text-red-400">
                    −{formatCurrency(dailyMap[selectedDate].expenses)}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleAddForDay(selectedDate)}
                  className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-full bg-white/5 border border-white/10 transition"
                >
                  + Add
                </button>
                {dailyMap[selectedDate]?.entryCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowDayModal(true)}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 transition"
                  >
                    View details
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* List view */}
      {view === "list" && (
        <div className="card !p-2 sm:!p-3">
          {entries.length === 0 ? (
            <div className="empty-state !py-12">
              <div className="text-5xl mb-4">📝</div>
              <p className="text-slate-300 font-semibold">No entries this month</p>
              <p className="text-sm text-dim mt-1">Start by adding your salary or an expense</p>
              <button onClick={() => setShowAddModal(true)} className="btn-primary mt-6">
                Add your first entry
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {sortEntriesByRecent(entries).map((entry) => (
                <div key={entry._id} className="list-item group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="icon-box">{getCategoryMeta(entry.category).icon}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge category={entry.category} />
                        <span className="text-xs text-dim tabular-nums">
                          {formatDate(entry.date)} · {formatTime(entry.date)}
                        </span>
                      </div>
                      {entry.message && (
                        <p className="text-sm text-muted truncate mt-0.5">{entry.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold whitespace-nowrap ${
                        entry.type === "income" ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {entry.type === "income" ? "+" : "−"}
                      {formatCurrency(entry.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleEditEntry(entry)}
                      className="hover-action-btn sm:opacity-0 sm:group-hover:opacity-100 text-muted hover:text-cyan-400 transition p-1"
                      title="Edit"
                    >
                      ✏️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Categories view */}
      {view === "categories" && (
        <div className="card">
          {!summary?.byCategory?.length ? (
            <div className="empty-state !py-12">
              <p className="text-4xl mb-3">🏷️</p>
              <p className="text-muted">No expense categories yet this month</p>
            </div>
          ) : (
            <div className="space-y-5">
              {summary.byCategory.map((cat) => {
                const meta = getCategoryMeta(cat._id);
                const pct =
                  summary.totalExpenses > 0
                    ? (cat.total / summary.totalExpenses) * 100
                    : 0;
                return (
                  <div key={cat._id} className="flex items-center gap-4">
                    <div className="icon-box text-2xl">{meta.icon}</div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <span className="font-bold text-slate-200">{meta.label}</span>
                        <span className="text-muted text-sm">
                          {formatCurrency(cat.total)} · {cat.count} txns
                        </span>
                      </div>
                      <div className="progress-track h-2.5">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <AddEntryModal
        open={showAddModal}
        onClose={closeEntryModal}
        onSuccess={loadData}
        defaultDate={addDate}
        entry={editingEntry}
      />

      <DaySummaryModal
        open={showDayModal}
        onClose={() => setShowDayModal(false)}
        date={selectedDate}
        onUpdate={loadData}
        onEdit={handleEditEntry}
      />
    </div>
  );
}
