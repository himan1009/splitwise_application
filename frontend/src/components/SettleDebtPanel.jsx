import { useState } from "react";
import api from "../api/api";
import DateTimeFields from "./DateTimeFields";
import AmountInput from "./AmountInput";
import SlowLoadHint from "./ui/SlowLoadHint";
import { getApiErrorMessage } from "../utils/apiErrors";
import { combineDateAndTime, formatCurrency, getNowDateString, getNowTimeString } from "../utils/format";

export default function SettleDebtPanel({ otherUserId, otherUserName, net, onSettled }) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(getNowDateString());
  const [time, setTime] = useState(getNowTimeString());
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const absNet = Math.abs(net);
  const isSettled = absNet < 0.01;
  const theyOweMe = net > 0;

  const handlePartialSettle = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError("Enter a valid amount");
      return;
    }
    if (Number(amount) > absNet) {
      setError(`Cannot exceed outstanding ${formatCurrency(absNet)}`);
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await api.post("/debts/settle", {
        otherUserId,
        amount: Number(amount),
        recordedAt: combineDateAndTime(date, time),
        note: note.trim() || undefined,
      });
      setAmount("");
      setNote("");
      onSettled();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to record settlement"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleFullSettle = async () => {
    if (!window.confirm(`Mark full ${formatCurrency(absNet)} as settled with ${otherUserName}?`)) {
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await api.post("/debts/settle", {
        otherUserId,
        full: true,
        recordedAt: combineDateAndTime(date, time),
        note: note.trim() || undefined,
      });
      setAmount("");
      setNote("");
      onSettled();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to settle"));
    } finally {
      setSubmitting(false);
    }
  };

  if (isSettled) {
    return (
      <div className="card !p-5 text-center border border-emerald-500/20 bg-emerald-500/5">
        <p className="text-3xl mb-2">✅</p>
        <p className="font-semibold text-emerald-400">All settled with {otherUserName}</p>
        <p className="text-sm text-dim mt-1">No outstanding balance</p>
      </div>
    );
  }

  const remainingAfter =
    amount && Number(amount) > 0 ? Math.max(absNet - Number(amount), 0) : absNet;

  return (
    <div className="card !p-5 space-y-4 border border-cyan-500/20 bg-cyan-500/5">
      <div>
        <h2 className="section-title flex items-center gap-2">
          <span>💳</span> Record Settlement
        </h2>
        <p className="text-sm text-muted mt-1">
          {theyOweMe
            ? `${otherUserName} owes you ${formatCurrency(absNet)}`
            : `You owe ${otherUserName} ${formatCurrency(absNet)}`}
        </p>
        <p className="text-xs text-dim mt-1.5">
          Either you or {otherUserName} can record a payment — it updates for both of you.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
          {error}
        </p>
      )}

      <form onSubmit={handlePartialSettle} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">
              {theyOweMe ? "Amount received (₹)" : "Amount paid (₹)"}
            </label>
            <AmountInput
              value={amount}
              onChange={setAmount}
              placeholder={`Max ${absNet}`}
            />
            {amount && Number(amount) > 0 && Number(amount) < absNet && (
              <p className="text-xs text-cyan-400/80 mt-1.5 font-medium">
                Remaining after this: {formatCurrency(remainingAfter)}
              </p>
            )}
            {amount && Number(amount) >= absNet && (
              <p className="text-xs text-emerald-400/80 mt-1.5 font-medium">
                This will fully settle the debt
              </p>
            )}
          </div>
          <DateTimeFields
            date={date}
            time={time}
            onDateChange={setDate}
            onTimeChange={setTime}
            dateLabel="Payment date"
            smartTimeOnDateChange
            showTimezoneHint
          />
        </div>

        <div>
          <label className="label">Note (optional)</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. UPI, cash, returned in instalment"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <SlowLoadHint active={submitting} compact />

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={submitting || !amount}
            className="btn-primary flex-1"
          >
            {submitting
              ? "Saving..."
              : theyOweMe
              ? `Record ₹${amount || "…"} received`
              : `Record ₹${amount || "…"} paid`}
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleFullSettle}
            className="btn-success flex-1"
          >
            Settle full {formatCurrency(absNet)}
          </button>
        </div>
      </form>
    </div>
  );
}
