import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import SlowLoadHint from "../components/ui/SlowLoadHint";
import { getApiErrorMessage } from "../utils/apiErrors";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsError(false);
    setMsg("");
    setLoading(true);

    try {
      await api.post("/auth/register", { name, email, password });
      setMsg("Account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setIsError(true);
      setMsg(err.response?.data?.message || getApiErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-world">
      <div className="login-grid" />
      <div className="login-aurora login-aurora-1" />
      <div className="login-aurora login-aurora-2" />
      <div className="login-aurora login-aurora-3" />
      <div className="login-noise" />
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />

      <div className="login-shell login-shell-single">
        <div className="login-panel">
          <div className="login-mobile-brand">
            <span className="login-mobile-brand-icon">💸</span>
            <span className="login-mobile-brand-text">FinTrack</span>
          </div>
          <div className="login-panel-glow" />

          <div className="login-form-wrap">
            <div className="login-form-header">
              <p className="login-form-eyebrow">Get started free</p>
              <h2 className="login-form-title">Create your account</h2>
              <p className="login-form-sub">Set up your profile in under a minute</p>
            </div>

            {msg && (
              <div className={isError ? "login-error" : "login-success"}>
                <span>{isError ? "✕" : "✓"}</span> {msg}
              </div>
            )}

            <form onSubmit={handleRegister} className="login-form">
              <div className={`login-field ${focused === "name" ? "login-field-active" : ""}`}>
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused(null)}
                  required
                />
              </div>
              <div className={`login-field ${focused === "email" ? "login-field-active" : ""}`}>
                <label>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  required
                />
              </div>
              <div className={`login-field ${focused === "password" ? "login-field-active" : ""}`}>
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  required
                  minLength={6}
                />
              </div>

              <button type="submit" disabled={loading} className="login-submit">
                <span className="login-submit-text">
                  {loading ? "Creating account..." : "Create account"}
                </span>
                <span className="login-submit-arrow">→</span>
                <span className="login-submit-shine" />
              </button>

              <SlowLoadHint
                active={loading}
                compact
                message="Creating your account… Server may take a moment if the free database was idle."
              />
            </form>

            <div className="login-footer">
              <span>Already have an account?</span>
              <button type="button" onClick={() => navigate("/login")}>
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
