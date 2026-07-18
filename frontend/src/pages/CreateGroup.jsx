import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import PersonSelectList from "../components/PersonSelectList";
import { getStoredUserId } from "../utils/auth";
import SlowLoadHint from "../components/ui/SlowLoadHint";

export default function CreateGroup() {
  const [name, setName] = useState("");
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const myId = getStoredUserId();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await api.get("/groups/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load users", err);
    }
  };

  const createGroup = async (e) => {
    e?.preventDefault();
    if (!name.trim()) {
      alert("Enter a group name");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/groups", { name, memberIds: selected });
      navigate("/groups");
    } catch (err) {
      console.error("Failed to create group", err);
      alert("Failed to create group");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="form-card card space-y-6">
        <div>
          <button type="button" onClick={() => navigate("/groups")} className="back-link">
            ← Back to Groups
          </button>
          <h1 className="page-title text-xl sm:text-2xl">Create Group</h1>
          <p className="page-subtitle">Start a new trip or shared expense group</p>
        </div>

        <form onSubmit={createGroup} className="space-y-5">
          <div>
            <label className="label">Group name</label>
            <input
              className="input"
              placeholder="e.g. Goa Trip 2026, Flatmates, Office Lunch"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Add members</label>
            <PersonSelectList
              users={users}
              value={selected}
              onChange={setSelected}
              multiple
              disabledIds={[myId]}
              emptyMessage="No users found"
            />
            <p className="text-xs text-dim mt-2">
              {selected.length + 1} member{selected.length !== 0 ? "s" : ""} including you
            </p>
          </div>

          <SlowLoadHint active={submitting} compact />

          <div className="flex flex-col gap-3 sm:flex-row pt-2">
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="btn-primary flex-1 w-full"
            >
              {submitting ? "Creating..." : "Create Group"}
            </button>
            <button type="button" onClick={() => navigate("/groups")} className="btn-secondary flex-1 w-full">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
