import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import PageLoader from "../components/ui/PageLoader";

import { getApiErrorMessage } from "../utils/apiErrors";

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await api.get("/groups");
      setGroups(res.data);
    } catch (err) {
      console.error("Failed to load groups", err);
      setGroups([]);
      setLoadError(getApiErrorMessage(err, "Could not load groups. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLoader message="Loading groups..." />;
  }

  const totalMembers = groups.reduce((sum, g) => sum + g.members.length, 0);

  return (
    <div className="page-container space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Groups</h1>
          <p className="page-subtitle">Split bills on trips and outings with friends</p>
        </div>
        <button onClick={() => navigate("/create-group")} className="btn-primary !py-3 !px-6">
          + Create Group
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="metric-card" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
          <p className="metric-label">Your Groups</p>
          <p className="metric-value">{groups.length}</p>
        </div>
        <div className="metric-card" style={{ background: "linear-gradient(135deg, #0891b2, #06b6d4)" }}>
          <p className="metric-label">Total Members</p>
          <p className="metric-value">{totalMembers}</p>
        </div>
        <div
          className="metric-card col-span-2 sm:col-span-1"
          style={{ background: "linear-gradient(135deg, #475569, #334155)" }}
        >
          <p className="metric-label">Use case</p>
          <p className="metric-value text-base sm:text-lg">Trips & shared costs</p>
        </div>
      </div>

      {loadError && (
        <div className="card !p-4 border border-red-500/25 bg-red-500/10 text-red-300 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span>{loadError}</span>
          <button type="button" onClick={loadGroups} className="btn-ghost !text-red-300 shrink-0">
            Retry
          </button>
        </div>
      )}

      {!loadError && groups.length === 0 ? (
        <div className="empty-state">
          <p className="text-5xl mb-3">✈️</p>
          <p className="text-slate-300 font-semibold">No groups yet</p>
          <p className="text-sm text-dim mt-1">Create a group for your next trip or outing</p>
          <button onClick={() => navigate("/create-group")} className="btn-primary mt-6">
            Create your first group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((g) => (
            <div
              key={g._id}
              onClick={() => navigate(`/group/${g._id}`)}
              className="card-hover group !p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <h3
                  className="font-bold text-slate-200 group-hover:text-cyan-400 transition"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  {g.name}
                </h3>
                <span className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold px-2.5 py-1 rounded-lg shrink-0">
                  {g.members.length}
                </span>
              </div>

              <div className="avatar-stack mt-4">
                {g.members.slice(0, 5).map((m) => (
                  <div
                    key={m._id}
                    className="avatar-stack-item app-avatar !w-8 !h-8 !text-xs"
                    title={m.name}
                  >
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {g.members.length > 5 && (
                  <div className="avatar-stack-more">+{g.members.length - 5}</div>
                )}
              </div>

              <p className="text-sm text-cyan-400/80 font-semibold mt-4 group-hover:translate-x-1 transition-transform">
                View details →
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
