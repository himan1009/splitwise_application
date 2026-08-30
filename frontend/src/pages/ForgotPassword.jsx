import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import SlowLoadHint from "../components/ui/SlowLoadHint";
import { getApiErrorMessage } from "../utils/apiErrors";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMsg(res.data.message);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not send reset email"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-world">
      <div className="login-grid" />
      <div className="login-shell login-shell-single">
        <div className="login-panel">
          <div className="login-form-wrap">
            <div className="login-form-header">
              <p className="login-form-eyebrow">Account recovery</p>
              <h2 className="login-form-title">Forgot password?</h2>
              <p className="login-form-sub">
                Enter your email and we&apos;ll send you a link to reset your password.
              </p>
            </div>

            {msg && (
              <div className="login-success">
                <span>✓</span> {msg}
              </div>
            )}
            {error && (
              <div className="login-error">
                <span>✕</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-field login-field-active">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <button type="submit" disabled={loading || !email} className="login-submit">
                <span className="login-submit-text">{loading ? "Sending..." : "Send reset link"}</span>
                <span className="login-submit-arrow">→</span>
              </button>

              <SlowLoadHint
                active={loading}
                compact
                message="Sending email… Server may take a moment to wake up if idle."
              />
            </form>

            <div className="login-footer">
              <button type="button" onClick={() => navigate("/login")}>
                Back to sign in
              </button>
              <span className="mx-2 text-slate-600">·</span>
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300">
                Create account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
