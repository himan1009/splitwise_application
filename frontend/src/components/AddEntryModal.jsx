import { useEffect, useState } from "react";
import api from "../api/api";
import Modal from "./ui/Modal";
import SlowLoadHint from "./ui/SlowLoadHint";
import DateTimeFields from "./DateTimeFields";
import AmountInput from "./AmountInput";
import { getCategoryMeta } from "../constants/categories";
import {
  combineDateAndTime,
  getNowDateString,
  getNowTimeString,
  splitDateTime,
} from "../utils/format";

export default function AddEntryModal({ open, onClose, onSuccess, defaultDate, entry }) {
  const isEdit = Boolean(entry?._id);

  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(getNowDateString());
  const [time, setTime] = useState(getNowTimeString());
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState({ expense: [], income: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setError("");

    api
      .get("/personal/categories")
      .then((res) => {
        if (cancelled) return;

        setCategories(res.data);

        if (entry) {
          const parts = splitDateTime(entry.date);
          setType(entry.type);
          setAmount(String(entry.amount));
          setDate(parts.date);
          setTime(parts.time);
          setCategory(entry.category);
          setMessage(entry.message || "");
        } else {
          const parts = defaultDate
            ? splitDateTime(`${defaultDate}T12:00:00`)
            : { date: getNowDateString(), time: getNowTimeString() };
          setType("expense");
          setAmount("");
          setMessage("");
          setDate(parts.date);
          setTime(parts.time);
          setCategory(res.data.expense[0] || "");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load categories. Please try again.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, defaultDate, entry]);

  const switchType = (newType) => {
    setType(newType);
    const list = newType === "income" ? categories.income : categories.expense;
    if (message.trim() && list.includes("other")) {
      setCategory("other");
    } else if (list.length) {
      setCategory(list[0]);
    }
  };

  const handleMessageChange = (e) => {
    const val = e.target.value;
    setMessage(val);

    const list = type === "income" ? categories.income : categories.expense;
    if (val.trim() && list.includes("other")) {
      setCategory("other");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category) {
      setError("Please select a category");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError("Enter a valid amount greater than 0");
      return;
    }
    setError("");
    setLoading(true);

    const payload = {
      type,
      amount: Number(amount),
      date: combineDateAndTime(date, time),
      category,
      message,
    };

    try {
      if (isEdit) {
        await api.put(`/personal/entries/${entry._id}`, payload);
      } else {
        await api.post("/personal/entries", payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (isEdit ? "Failed to update entry" : "Failed to add entry")
      );
    } finally {
      setLoading(false);
    }
  };

  const currentCategories = type === "income" ? categories.income : categories.expense;
  const selectedMeta = category ? getCategoryMeta(category) : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Entry" : "Add Entry"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="modal-form-fields space-y-5">
        <div className="type-toggle-wrap">
          <button
            type="button"
            onClick={() => switchType("expense")}
            className={`type-toggle-btn ${type === "expense" ? "type-toggle-btn-expense-active" : ""}`}
          >
            💸 Expense
          </button>
          <button
            type="button"
            onClick={() => switchType("income")}
            className={`type-toggle-btn ${type === "income" ? "type-toggle-btn-income-active" : ""}`}
          >
            💰 Income
          </button>
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
            {error}
          </div>
        )}

        <div>
          <label className="label">Amount</label>
          <AmountInput
            value={amount}
            onChange={setAmount}
            placeholder="0"
            size="lg"
            required
          />
        </div>

        <DateTimeFields
          date={date}
          time={time}
          onDateChange={setDate}
          onTimeChange={setTime}
        />

        <div>
          <label className="label">
            Category
            {selectedMeta && (
              <span className="ml-2 text-cyan-400/80 font-normal">
                — {selectedMeta.icon} {selectedMeta.label}
              </span>
            )}
          </label>
          <div className="category-grid">
            {currentCategories.map((cat) => {
              const meta = getCategoryMeta(cat);
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={
                    isSelected
                      ? "category-chip-active category-chip"
                      : "category-chip category-chip-inactive"
                  }
                >
                  <span className="text-2xl">{meta.icon}</span>
                  <span>{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="label">
            Note (optional)
            {message.trim() && (
              <span className="ml-2 text-dim font-normal text-xs">→ category set to Other</span>
            )}
          </label>
          <textarea
            value={message}
            onChange={handleMessageChange}
            placeholder="What was this for? (sets category to Other)"
            rows={2}
            className="input resize-none"
          />
        </div>

        <SlowLoadHint active={loading} compact />
        </div>

        <div className="modal-form-actions">
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !category}
            className={`flex-1 py-3.5 rounded-xl font-bold text-white transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 ${
              type === "income"
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-700"
                : "bg-gradient-to-r from-red-500 to-rose-600 shadow-red-500/25 hover:from-red-600 hover:to-rose-700"
            }`}
          >
            {loading ? "Saving..." : isEdit ? "Save Changes" : type === "income" ? "💰 Add Income" : "💸 Add Expense"}
          </button>
          {isEdit && (
            <button type="button" onClick={onClose} className="btn-secondary !px-5">
              Cancel
            </button>
          )}
        </div>
        </div>
      </form>
    </Modal>
  );
}
