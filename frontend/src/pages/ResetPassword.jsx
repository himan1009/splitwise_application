import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/api";
import SlowLoadHint from "../components/ui/SlowLoadHint";
import { getApiErrorMessage } from "../utils/apiErrors";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!token) {
      setError("Invalid reset link. Request a new one from the forgot password page.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", { token, password });
      navigate("/login", { replace: true, state: { resetSuccess: res.data.message } });
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not reset password"));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="login-world">
        <div className="login-grid" />
        <div className="login-shell login-shell-single">
          <div className="login-panel">
            <div className="login-form-wrap text-center">
              <p className="text-4xl mb-4">❌</p>
              <h2 className="login-form-title">Invalid reset link</h2>
              <p className="login-form-sub mt-3">This link is missing or broken. Request a new reset email.</p>
              <button type="button" onClick={() => navigate("/forgot-password")} className="login-submit w-full mt-8">
                <span className="login-submit-text">Forgot password</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-world">
      <div className="login-grid" />
      <div className="login-shell login-shell-single">
        <div className="login-panel">
          <div className="login-form-wrap">
            <div className="login-form-header">
              <p className="login-form-eyebrow">Account recovery</p>
              <h2 className="login-form-title">Set new password</h2>
              <p className="login-form-sub">Choose a strong password with at least 8 characters.</p>
            </div>

            {error && (
              <div className="login-error">
                <span>✕</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-field">
                <label>New password</label>
                <input
                  type="password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>

              <div className="login-field">
                <label>Confirm password</label>
                <input
                  type="password"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>

              <button type="submit" disabled={loading} className="login-submit">
                <span className="login-submit-text">{loading ? "Updating..." : "Update password"}</span>
                <span className="login-submit-arrow">→</span>
              </button>

              <SlowLoadHint active={loading} compact message="Updating password…" />
            </form>

            <div className="login-footer">
              <button type="button" onClick={() => navigate("/login")}>
                Back to sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
