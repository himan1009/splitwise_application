import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import Modal from "./ui/Modal";
import SlowLoadHint from "./ui/SlowLoadHint";
import DateTimeFields from "./DateTimeFields";
import AmountInput from "./AmountInput";
import {
  EXPENSE_CATEGORY_IDS,
  INCOME_CATEGORY_IDS,
  getCategoryMeta,
} from "../constants/categories";
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
  const [categoryQuery, setCategoryQuery] = useState("");
  const [categories, setCategories] = useState({
    expense: EXPENSE_CATEGORY_IDS,
    income: INCOME_CATEGORY_IDS,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resolveList = (list, fallback) =>
    Array.isArray(list) && list.length ? list : fallback;

  const pickCategory = (desired, list) => {
    if (desired && list.includes(desired)) return desired;
    return list[0] || "other";
  };

  const hydrateForm = (lists) => {
    if (entry) {
      const parts = splitDateTime(entry.date);
      const nextType = entry.type === "income" ? "income" : "expense";
      const list = nextType === "income" ? lists.income : lists.expense;
      setType(nextType);
      setAmount(String(entry.amount ?? ""));
      setDate(parts.date);
      setTime(parts.time);
      setMessage(entry.message || "");
      setCategory(pickCategory(entry.category, list));
      return;
    }

    const parts = defaultDate
      ? splitDateTime(`${defaultDate}T12:00:00`)
      : { date: getNowDateString(), time: getNowTimeString() };
    setType("expense");
    setAmount("");
    setMessage("");
    setDate(parts.date);
    setTime(parts.time);
    setCategory(pickCategory("", lists.expense));
  };

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    const fallbackLists = {
      expense: EXPENSE_CATEGORY_IDS,
      income: INCOME_CATEGORY_IDS,
    };

    setError("");
    setCategoryQuery("");
    setCategories(fallbackLists);
    hydrateForm(fallbackLists);

    api
      .get("/personal/categories")
      .then((res) => {
        if (cancelled) return;
        const lists = {
          expense: resolveList(res.data?.expense, EXPENSE_CATEGORY_IDS),
          income: resolveList(res.data?.income, INCOME_CATEGORY_IDS),
        };
        setCategories(lists);
        hydrateForm(lists);
      })
      .catch(() => {
        if (cancelled) return;
        setCategories(fallbackLists);
        hydrateForm(fallbackLists);
      });

    return () => {
      cancelled = true;
    };
  }, [open, defaultDate, entry]);

  const switchType = (newType) => {
    setType(newType);
    setCategoryQuery("");
    const list = newType === "income" ? categories.income : categories.expense;
    if (!list.length) return;
    if (category && list.includes(category)) return;
    setCategory(list[0]);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allowed = type === "income" ? categories.income : categories.expense;
    if (!category || !allowed.includes(category)) {
      setError("Please select a valid category");
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

  const currentCategories = useMemo(() => {
    const list = type === "income" ? categories.income : categories.expense;
    if (category && !list.includes(category)) {
      return [category, ...list];
    }
    return list;
  }, [type, categories, category]);
  const selectedMeta = category ? getCategoryMeta(category) : null;
  const filteredCategories = useMemo(() => {
    const q = categoryQuery.trim().toLowerCase();
    if (!q) return currentCategories;
    return currentCategories.filter((cat) => {
      const meta = getCategoryMeta(cat);
      return meta.label.toLowerCase().includes(q) || cat.includes(q);
    });
  }, [currentCategories, categoryQuery]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Entry" : "Add Entry"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="modal-form-fields space-y-5">
        <div className="type-toggle-wrap">
          <button
            type="button"
            onClick={() => switchType("expense")}
            className={`type-toggle-btn ${type === "expense" ? "type-toggle-btn-expense-active" : ""}`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => switchType("income")}
            className={`type-toggle-btn ${type === "income" ? "type-toggle-btn-income-active" : ""}`}
          >
            Income
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
              <span className="ml-2 text-emerald-400/80 font-normal">
                — {selectedMeta.icon} {selectedMeta.label}
              </span>
            )}
          </label>
          <input
            type="search"
            className="input mb-3"
            placeholder="Search categories"
            value={categoryQuery}
            onChange={(e) => setCategoryQuery(e.target.value)}
            autoComplete="off"
            enterKeyHint="search"
          />
          <div className="category-grid" role="listbox" aria-label="Categories">
            {filteredCategories.length === 0 && (
              <p className="col-span-full text-sm text-dim px-1 py-3">
                No categories match “{categoryQuery}”.
              </p>
            )}
            {filteredCategories.map((cat) => {
              const meta = getCategoryMeta(cat);
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => setCategory(cat)}
                  className={
                    isSelected
                      ? "category-chip-active category-chip"
                      : "category-chip category-chip-inactive"
                  }
                >
                  <span className="text-xl sm:text-2xl" aria-hidden>
                    {meta.icon}
                  </span>
                  <span>{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="label">Note (optional)</label>
          <textarea
            value={message}
            onChange={handleMessageChange}
            placeholder="What was this for? e.g. dinner with friends"
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
            className={`flex-1 py-3.5 rounded-xl font-bold text-white transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 min-h-[48px] ${
              type === "income"
                ? "bg-[#1d9e75] shadow-emerald-500/20 hover:bg-[#1b8f6a]"
                : "bg-rose-600 shadow-rose-500/20 hover:bg-rose-500"
            }`}
          >
            {loading ? "Saving..." : isEdit ? "Save changes" : type === "income" ? "Add income" : "Add expense"}
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
