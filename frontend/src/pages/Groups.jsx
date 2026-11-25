import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import PageLoader from "../components/ui/PageLoader";
import SecurityNotice from "../components/SecurityNotice";
import { formatCurrency, formatDateTime } from "../utils/format";
import { getApiErrorMessage } from "../utils/apiErrors";

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [overview, setOverview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("activity");
  const navigate = useNavigate();

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [groupsRes, overviewRes] = await Promise.all([
        api.get("/groups"),
        api.get("/groups/overview").catch(() => ({ data: [] })),
      ]);
      setGroups(groupsRes.data);
      setOverview(overviewRes.data);
    } catch (err) {
      console.error("Failed to load groups", err);
      setGroups([]);
      setOverview([]);
      setLoadError(getApiErrorMessage(err, "Could not load groups. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const overviewMap = useMemo(() => {
    const map = {};
    overview.forEach((o) => {
      map[o.groupId] = o;
    });
    return map;
  }, [overview]);

  const displayedGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = [...groups];
    if (q) {
      list = list.filter((g) => g.name.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      const oa = overviewMap[a._id];
      const ob = overviewMap[b._id];
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "balance") {
        const na = Math.abs(oa?.net || 0);
        const nb = Math.abs(ob?.net || 0);
        return nb - na;
      }
      const ta = oa?.lastActivity ? new Date(oa.lastActivity).getTime() : 0;
      const tb = ob?.lastActivity ? new Date(ob.lastActivity).getTime() : 0;
      return tb - ta;
    });
    return list;
  }, [groups, overviewMap, search, sortBy]);

  if (loading) {
    return <PageLoader message="Loading groups..." />;
  }

  const totalMembers = groups.reduce((sum, g) => sum + g.members.length, 0);
  const totalGroupSpend = overview.reduce((s, o) => s + (o.totalSpend || 0), 0);
  const netAcrossGroups = overview.reduce((s, o) => s + (o.net || 0), 0);

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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="metric-card">
          <p className="metric-label">Your groups</p>
          <p className="metric-value">{groups.length}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">People</p>
          <p className="metric-value">{totalMembers}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Total group spend</p>
          <p className="metric-value text-lg sm:text-xl">{formatCurrency(totalGroupSpend)}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Your net (all groups)</p>
          <p
            className={`metric-value text-lg sm:text-xl ${
              netAcrossGroups >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {netAcrossGroups >= 0 ? "+" : "−"}
            {formatCurrency(Math.abs(netAcrossGroups))}
          </p>
        </div>
      </div>

      <motionControls search={search} setSearch={setSearch} sortBy={sortBy} setSortBy={setSortBy} />

      {loadError && (
        <div className="card !p-4 border border-red-500/25 bg-red-500/10 text-red-300 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span>{loadError}</span>
          <button type="button" onClick={loadGroups} className="btn-ghost !text-red-300 shrink-0">
            Retry
          </button>
        </div>
      )}

      <SecurityNotice compact />

      {!loadError && groups.length === 0 ? (
        <div className="empty-state">
          <p className="text-slate-300 font-semibold text-lg">No groups yet</p>
          <p className="text-sm text-dim mt-1">Create a group for a trip, rent, or a dinner out.</p>
          <button onClick={() => navigate("/create-group")} className="btn-primary mt-6">
            Create your first group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedGroups.map((g) => {
            const o = overviewMap[g._id];
            return (
              <div
                key={g._id}
                onClick={() => navigate(`/group/${g._id}`)}
                className="card-hover group !p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3
                    className="font-bold text-slate-200 group-hover:text-emerald-400 transition"
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    {g.name}
                  </h3>
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold px-2.5 py-1 rounded-lg shrink-0">
                    {g.members.length}
                  </span>
                </div>

                {o && (
                  <div className="mt-3 space-y-1 text-sm">
                    <p className="text-dim">
                      {o.expenseCount} expense{o.expenseCount !== 1 ? "s" : ""} ·{" "}
                      {formatCurrency(o.totalSpend)} total
                    </p>
                    {Math.abs(o.net) >= 0.01 ? (
                      <p className={o.net >= 0 ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
                        {o.net >= 0 ? "You're owed" : "You owe"} {formatCurrency(Math.abs(o.net))}
                      </p>
                    ) : (
                      <p className="text-slate-400 font-medium">Settled in this group</p>
                    )}
                    {o.lastActivity && (
                      <p className="text-xs text-dim">Last activity {formatDateTime(o.lastActivity)}</p>
                    )}
                    {o.isAdmin && (
                      <span className="inline-block text-[0.65rem] uppercase tracking-wide text-amber-400/90 mt-1">
                        You're admin
                      </span>
                    )}
                  </div>
                )}

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

                <p className="text-sm text-emerald-400/80 font-semibold mt-4 group-hover:translate-x-1 transition-transform">
                  Open group
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function motionControls({ search, setSearch, sortBy, setSortBy }) {
  return (
    <div className="card !p-3 flex flex-col sm:flex-row gap-3 sm:items-center">
      <input
        type="search"
        className="input !py-2.5 flex-1"
        placeholder="Search groups…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select
        className="input !py-2.5 !w-auto min-w-[10rem]"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        aria-label="Sort groups"
      >
        <option value="activity">Recent activity</option>
        <option value="balance">Largest balance</option>
        <option value="name">Name A–Z</option>
      </select>
    </div>
  );
}