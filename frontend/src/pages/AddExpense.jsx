import { useEffect, useState } from "react";
import api from "../api/api";
import DateTimeFields from "../components/DateTimeFields";
import AmountInput from "../components/AmountInput";
import SlowLoadHint from "../components/ui/SlowLoadHint";
import {
  combineDateAndTime,
  getNowDateString,
  getNowTimeString,
  splitDateTime,
} from "../utils/format";
import { normalizeId } from "../utils/debt";

function inferSplitState(expense, members) {
  const splitIds = expense.splits.map((s) => s.user._id);
  const amounts = expense.splits.map((s) => Number(s.amount));
  const total = Number(expense.amount);
  const rounded = amounts.map((a) => Math.round(a * 100) / 100);
  const activeCount = amounts.filter((a) => a > 0).length;

  const isEqual =
    activeCount > 0 &&
    activeCount === splitIds.length &&
    rounded.every((a) => a === rounded[0]);

  if (isEqual) {
    return {
      type: "equal",
      selected: splitIds,
      values: {},
    };
  }

  const percentSum = amounts.reduce(
    (sum, a) => sum + (total > 0 ? (a / total) * 100 : 0),
    0
  );
  if (Math.abs(percentSum - 100) < 0.5) {
    const values = {};
    expense.splits.forEach((s) => {
      values[s.user._id] = String(
        total > 0 ? Math.round((Number(s.amount) / total) * 10000) / 100 : 0
      );
    });
    return {
      type: "percent",
      selected: members.map((m) => m._id),
      values,
    };
  }

  const values = {};
  expense.splits.forEach((s) => {
    values[s.user._id] = String(s.amount);
  });

  return {
    type: "amount",
    selected: members.map((m) => m._id),
    values,
  };
}

function buildEqualSplits(amount, selected) {
  let allocated = 0;
  return selected.map((id, idx) => {
    if (idx === selected.length - 1) {
      return {
        user: id,
        amount: Math.round((Number(amount) - allocated) * 100) / 100,
      };
    }
    const share = Math.round((Number(amount) / selected.length) * 100) / 100;
    allocated += share;
    return { user: id, amount: share };
  });
}

export default function AddExpense({ group, onAdd, editingExpense, onCancelEdit }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const myId = normalizeId(user._id || user.id);
  const isEdit = Boolean(editingExpense?._id);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(myId);
  const [type, setType] = useState("equal");
  const [selected, setSelected] = useState(group.members.map((m) => m._id));
  const [values, setValues] = useState({});
  const [date, setDate] = useState(getNowDateString());
  const [time, setTime] = useState(getNowTimeString());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const resetNewForm = () => {
    setDescription("");
    setAmount("");
    setPaidBy(myId);
    setType("equal");
    setSelected(group.members.map((m) => m._id));
    setValues({});
    setDate(getNowDateString());
    setTime(getNowTimeString());
    setError("");
  };

  useEffect(() => {
    if (!editingExpense?._id) return;

    setDescription(editingExpense.description);
    setAmount(String(editingExpense.amount));
    setPaidBy(normalizeId(editingExpense.paidBy));
    const parts = splitDateTime(editingExpense.recordedAt || editingExpense.createdAt);
    setDate(parts.date);
    setTime(parts.time);
    const splitState = inferSplitState(editingExpense, group.members);
    setType(splitState.type);
    setSelected(splitState.selected);
    setValues(splitState.values);
    setError("");
  }, [editingExpense?._id]);

  const toggle = (id) =>
    setSelected((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
    );

  const buildSplits = () => {
    if (type === "equal") {
      return buildEqualSplits(amount, selected);
    }

    if (type === "amount") {
      return group.members.map((m) => ({
        user: m._id,
        amount: Number(values[m._id] || 0),
      }));
    }

    return group.members.map((m) => ({
      user: m._id,
      amount: (Number(values[m._id] || 0) * Number(amount)) / 100,
    }));
  };

  const validateSplits = (splits, totalAmount) => {
    if (type === "equal") {
      if (selected.length === 0) return "Select at least one person to split with";
      return null;
    }

    if (type === "amount") {
      const sum = splits.reduce((s, split) => s + Number(split.amount), 0);
      if (Math.abs(sum - totalAmount) > 0.01) {
        return "Split amounts must add up to the total expense";
      }
      return null;
    }

    const percentSum = group.members.reduce(
      (s, m) => s + Number(values[m._id] || 0),
      0
    );
    if (Math.abs(percentSum - 100) > 0.5) {
      return "Percentages must add up to 100%";
    }
    return null;
  };

  const submit = async (e) => {
    e?.preventDefault();
    if (!description.trim() || !amount || Number(amount) <= 0) {
      setError("Enter a description and valid amount");
      return;
    }

    const splits = buildSplits();
    const totalAmount = Number(amount);
    const splitError = validateSplits(splits, totalAmount);
    if (splitError) {
      setError(splitError);
      return;
    }

    const payload = {
      description: description.trim(),
      amount: totalAmount,
      paidBy,
      splits,
      recordedAt: combineDateAndTime(date, time),
    };

    setSubmitting(true);
    setError("");
    try {
      if (isEdit) {
        await api.put(`/expenses/${editingExpense._id}`, payload);
        onCancelEdit?.();
      } else {
        await api.post("/expenses", {
          groupId: group._id,
          ...payload,
        });
        resetNewForm();
      }

      onAdd();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save expense");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    resetNewForm();
    onCancelEdit?.();
  };

  return (
    <div
      id="add-expense-form"
      className={`card space-y-5 overflow-hidden ${isEdit ? "ring-2 ring-cyan-500/40" : ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="section-title flex items-center gap-2">
          <span>{isEdit ? "✏️" : "💸"}</span>
          {isEdit ? "Edit Expense" : "Add Expense"}
        </h3>
        {isEdit && (
          <button type="button" onClick={handleCancelEdit} className="btn-ghost !text-xs">
            Cancel edit
          </button>
        )}
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Description</label>
            <input
              className="input"
              placeholder="e.g. Dinner, Hotel, Cab"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Amount</label>
            <AmountInput
              value={amount}
              onChange={setAmount}
              placeholder="0"
            />
          </div>
        </div>

        <DateTimeFields
          date={date}
          time={time}
          onDateChange={setDate}
          onTimeChange={setTime}
          dateLabel="Expense date"
        />

        <div>
          <label className="label">Paid by</label>
          <div className="flex flex-wrap gap-2">
            {group.members.map((m) => (
              <button
                key={m._id}
                type="button"
                onClick={() => setPaidBy(m._id)}
                className={`split-member-chip ${
                  normalizeId(paidBy) === normalizeId(m._id)
                    ? "split-member-chip-selected"
                    : ""
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] shrink-0 ${
                    normalizeId(paidBy) === normalizeId(m._id)
                      ? "border-indigo-400 bg-indigo-500 text-white"
                      : "border-white/20"
                  }`}
                >
                  {normalizeId(paidBy) === normalizeId(m._id) ? "✓" : ""}
                </span>
                <span className="truncate">{m.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Split type</label>
          <div className="split-type-grid">
            {[
              { id: "equal", label: "Equal" },
              { id: "amount", label: "By Amount" },
              { id: "percent", label: "By %" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`option-chip ${type === t.id ? "option-chip-active" : ""}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {type === "equal" && (
          <div>
            <label className="label">Split among</label>
            <div className="flex flex-wrap gap-2">
              {group.members.map((m) => (
                <button
                  key={m._id}
                  type="button"
                  onClick={() => toggle(m._id)}
                  className={`split-member-chip ${
                    selected.includes(m._id) ? "split-member-chip-selected" : ""
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] shrink-0 ${
                      selected.includes(m._id)
                        ? "border-indigo-400 bg-indigo-500 text-white"
                        : "border-white/20"
                    }`}
                  >
                    {selected.includes(m._id) ? "✓" : ""}
                  </span>
                  <span className="truncate">{m.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {type !== "equal" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
            {group.members.map((m) => (
              <div key={m._id}>
                <label className="label !text-xs !mb-1">{m.name}</label>
                <AmountInput
                  value={values[m._id] || ""}
                  onChange={(val) => setValues({ ...values, [m._id]: val })}
                  placeholder={type === "percent" ? "%" : "0"}
                  showPrefix={type !== "percent"}
                />
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-400 font-medium bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
            {error}
          </p>
        )}

        <SlowLoadHint active={submitting} compact />

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? "Saving..." : isEdit ? "Update Expense" : "Add Expense"}
        </button>
      </form>
    </div>
  );
}
