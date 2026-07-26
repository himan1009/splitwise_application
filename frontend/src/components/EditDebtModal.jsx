import { useEffect, useState } from "react";
import api from "../api/api";
import Modal from "./ui/Modal";
import DateTimeFields from "./DateTimeFields";
import AmountInput from "./AmountInput";
import SlowLoadHint from "./ui/SlowLoadHint";
import { getApiErrorMessage } from "../utils/apiErrors";
import {
  combineDateAndTime,
  getNowDateString,
  getNowTimeString,
  splitDateTime,
} from "../utils/format";

export default function EditDebtModal({ open, debt, onClose, onSuccess }) {
  const isSettlement = debt?.type === "settlement";

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(getNowDateString());
  const [time, setTime] = useState(getNowTimeString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !debt) return;

    const parts = splitDateTime(debt.recordedAt || debt.createdAt);
    setAmount(String(debt.amount));
    setDescription(debt.description || "");
    setDate(parts.date);
    setTime(parts.time);
    setError("");
  }, [open, debt]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!debt?._id) return;

    if (!amount || Number(amount) <= 0) {
      setError("Enter a valid amount greater than 0");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.put(`/debts/${debt._id}`, {
        amount: Number(amount),
        description: description.trim() || "No description",
        recordedAt: combineDateAndTime(date, time),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to update entry"));
    } finally {
      setLoading(false);
    }
  };

  if (!debt) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isSettlement ? "Edit Settlement" : "Edit Debt Entry"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="modal-form-fields space-y-5">
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
              {error}
            </p>
          )}

          <div>
            <label className="label">Amount</label>
            <AmountInput value={amount} onChange={setAmount} placeholder="Enter amount" required />
          </div>

          <DateTimeFields
            date={date}
            time={time}
            onDateChange={setDate}
            onTimeChange={setTime}
            dateLabel={isSettlement ? "Payment date" : "When did this happen?"}
            smartTimeOnDateChange
            showTimezoneHint
          />

          <div>
            <label className="label">Note</label>
            <textarea
              className="input resize-none min-h-[4.5rem]"
              placeholder={isSettlement ? "Payment note" : "What was this for?"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <SlowLoadHint active={loading} compact />
        </div>

        <div className="modal-form-actions">
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary !px-5">
              Cancel
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
