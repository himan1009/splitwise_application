import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import DateTimeFields from "../components/DateTimeFields";
import AmountInput from "../components/AmountInput";
import PersonSelectList from "../components/PersonSelectList";
import { getStoredUserId } from "../utils/auth";
import SlowLoadHint from "../components/ui/SlowLoadHint";
import { getApiErrorMessage } from "../utils/apiErrors";
import { combineDateAndTime, getNowDateString, getNowTimeString } from "../utils/format";
import { isSameUser } from "../utils/debt";

export default function AddDebt() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("they_owe_me");
  const [date, setDate] = useState(getNowDateString());
  const [time, setTime] = useState(getNowTimeString());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const myId = getStoredUserId();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await api.get("/groups/users");
      setUsers(res.data.filter((u) => !isSameUser(u._id, myId)));
    } catch (err) {
      console.error("Failed to load users", err);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!selectedUser || !amount || Number(amount) <= 0) {
      setError("Please select a person and enter a valid amount");
      return;
    }

    setError("");

    const payload = {
      amount: Number(amount),
      description,
      recordedAt: combineDateAndTime(date, time),
      from: type === "they_owe_me" ? selectedUser : myId,
      to: type === "they_owe_me" ? myId : selectedUser,
    };

    setSubmitting(true);
    try {
      await api.post("/debts", payload);
      navigate("/debts");
    } catch (err) {
      console.error("Failed to add debt", err.response?.data);
      setError(getApiErrorMessage(err, "Something went wrong"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="form-card card space-y-6">
        <div>
          <button type="button" onClick={() => navigate("/debts")} className="back-link">
            ← Back to Debts
          </button>
          <h2 className="page-title text-xl sm:text-2xl">Add Personal Debt</h2>
          <p className="page-subtitle">Record money lent to or borrowed from a friend</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
              {error}
            </p>
          )}

          <div>
            <label className="label">Who is involved?</label>
            <PersonSelectList
              users={users}
              value={selectedUser}
              onChange={setSelectedUser}
              emptyMessage="No friends found — add people via groups first"
            />
          </div>

          <div>
            <label className="label">What happened?</label>
            <div className="option-chips">
              <button
                type="button"
                onClick={() => setType("they_owe_me")}
                className={`option-chip ${type === "they_owe_me" ? "option-chip-active" : ""}`}
              >
                They borrowed from me
              </button>
              <button
                type="button"
                onClick={() => setType("i_owe_them")}
                className={`option-chip ${type === "i_owe_them" ? "option-chip-active" : ""}`}
              >
                I borrowed from them
              </button>
            </div>
          </div>

          <div>
            <label className="label">Amount</label>
            <AmountInput
              value={amount}
              onChange={setAmount}
              placeholder="Enter amount"
            />
          </div>

          <DateTimeFields
            date={date}
            time={time}
            onDateChange={setDate}
            onTimeChange={setTime}
            dateLabel="When did this happen?"
            smartTimeOnDateChange
            showTimezoneHint
          />

          <div>
            <label className="label">Note (optional)</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Dinner, cab fare, emergency loan"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <SlowLoadHint active={submitting} compact />

          <div className="flex flex-col gap-3 sm:flex-row pt-2">
            <button type="submit" disabled={submitting} className="btn-success flex-1 w-full">
              {submitting ? "Saving..." : "Save Debt"}
            </button>
            <button type="button" onClick={() => navigate("/debts")} className="btn-secondary flex-1 w-full">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
