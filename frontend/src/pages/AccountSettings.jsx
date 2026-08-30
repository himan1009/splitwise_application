import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/api";
import { getStoredUser, clearSession } from "../utils/auth";
import { getApiErrorMessage } from "../utils/apiErrors";

export default function AccountSettings({ setIsAuthenticated }) {
  const location = useLocation();
  const [profile, setProfile] = useState(getStoredUser());
  const [newEmail, setNewEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadProfile = async () => {
    try {
      const res = await api.get("/auth/me");
      setProfile(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    } catch (err) {
      console.error("Failed to load profile", err);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setLoading(true);
    try {
      const res = await api.post("/auth/change-email", { newEmail });
      setMsg(res.data.message);
      setNewEmail("");
      await loadProfile();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not request email change"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCurrent = async () => {
    setError("");
    setMsg("");
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-current-email");
      setMsg(res.data.message);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not send verification email"));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPending = async () => {
    setLoading(true);
    try {
      await api.post("/auth/cancel-email-change");
      setMsg("Pending email change cancelled.");
      await loadProfile();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not cancel"));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearSession();
    if (setIsAuthenticated) setIsAuthenticated(false);
    window.location.href = "/login";
  };

  if (!profile) {
    return (
      <div className="page-container">
        <p className="text-muted">Loading account...</p>
      </div>
    );
  }

  return (
    <div className="page-container space-y-6 max-w-xl">
      <div>
        <h1 className="page-title">Account</h1>
        <p className="page-subtitle">Manage your email and verification</p>
      </div>

      {(location.state?.emailPrompt || profile.needsEmailAttention) && !profile.emailVerified && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          <p className="font-semibold text-amber-200">Update your email to keep your account safe</p>
          <p className="mt-2 text-amber-100/90">
            Your tracker entries, groups, and debts stay on this account — only your login email changes.
            Enter your real email below and confirm from that inbox.
          </p>
        </div>
      )}

      <div className="card space-y-4">
        <div>
          <p className="text-xs text-dim uppercase tracking-wide font-semibold">Current email</p>
          <p className="text-lg font-semibold text-slate-200 mt-1 break-all">{profile.email}</p>
          <p className={`text-sm mt-2 font-medium ${profile.emailVerified ? "text-emerald-400" : "text-amber-400"}`}>
            {profile.emailVerified ? "✓ Verified" : "⚠ Not verified — use a real email you can access"}
          </p>
        </div>

        {profile.pendingEmail && (
          <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-4 text-sm text-cyan-200">
            <p>
              Pending change to <strong>{profile.pendingEmail}</strong>. Check that inbox for the confirmation link.
            </p>
            <button type="button" onClick={handleCancelPending} className="btn-ghost !text-cyan-300 mt-3 !text-xs">
              Cancel pending change
            </button>
          </div>
        )}

        {msg && (
          <div className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5">
            {msg}
          </div>
        )}
        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
            {error}
          </div>
        )}

        {!profile.emailVerified && !profile.pendingEmail && (
          <div className="space-y-3">
            <p className="text-sm text-muted">
              If you signed up with a dummy email, change it below to your real email. If this email is correct, send a verification link.
            </p>
            <button type="button" onClick={handleVerifyCurrent} disabled={loading} className="btn-secondary w-full">
              Send verification to current email
            </button>
          </div>
        )}
      </div>

      <div className="card space-y-4">
        <h2 className="section-title">Change email</h2>
        <p className="text-sm text-dim">
          Enter your real email. We&apos;ll send a confirmation link to the <strong>new</strong> address. After you click it, your login email updates and is marked verified.
        </p>
        <form onSubmit={handleChangeEmail} className="space-y-4">
          <div>
            <label className="label">New email address</label>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <button type="submit" disabled={loading || !newEmail} className="btn-primary w-full">
            {loading ? "Sending..." : "Send confirmation to new email"}
          </button>
        </form>
      </div>

      <div className="card">
        <h2 className="section-title mb-2">Signed in as</h2>
        <p className="text-muted text-sm mb-4">{profile.name}</p>
        <button type="button" onClick={logout} className="btn-ghost !text-red-400">
          Sign out
        </button>
      </div>
    </div>
  );
}
