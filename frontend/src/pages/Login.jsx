import { useState } from "react";
import api from "../api/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import SlowLoadHint from "../components/ui/SlowLoadHint";
import { getApiErrorMessage } from "../utils/apiErrors";
import { getSafeReturnPath } from "../utils/auth";

export default function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resendMsg, setResendMsg] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setUnverifiedEmail("");
    setResendMsg("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      const user = res.data.user;
      user.id = user.id || user._id;

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(user));

      setIsAuthenticated(true);
      if (user.needsEmailAttention) {
        navigate("/account", { replace: true, state: { emailPrompt: true } });
        return;
      }
      const returnTo = getSafeReturnPath(searchParams.get("returnTo"));
      navigate(returnTo, { replace: true });
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(err.response.data.email || email);
        setError(err.response.data.message);
      } else {
        setError(getApiErrorMessage(err, "Login failed"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const targetEmail = unverifiedEmail || email;
    if (!targetEmail) return;
    setResendLoading(true);
    setResendMsg("");
    try {
      const res = await api.post("/auth/resend-verification", { email: targetEmail });
      setResendMsg(res.data.message);
    } catch (err) {
      setResendMsg(getApiErrorMessage(err, "Could not resend email"));
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="login-world">
      {/* Animated background layers */}
      <div className="login-grid" />
      <div className="login-aurora login-aurora-1" />
      <div className="login-aurora login-aurora-2" />
      <div className="login-aurora login-aurora-3" />
      <div className="login-noise" />

      {/* Floating orbs */}
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-orb login-orb-3" />

      <div className="login-shell">
        {/* Left — brand experience */}
        <div className="login-hero">
          <div className="login-hero-inner">
            <div className="login-badge">
              <span className="login-badge-dot" />
              Your money, decoded
            </div>

            <h1 className="login-title">
              <span className="login-title-line">Fin</span>
              <span className="login-title-line login-title-accent">Track</span>
            </h1>

            <p className="login-tagline">
              The smarter way to track spending, split bills, and stay in control of your finances.
            </p>

            <div className="login-features">
              {[
                { icon: "📊", label: "Monthly tracking", sub: "Salary to daily spends" },
                { icon: "👥", label: "Group splitting", sub: "Trips & shared costs" },
                { icon: "📈", label: "Smart reports", sub: "See where money goes" },
              ].map((f) => (
                <div key={f.label} className="login-feature-card">
                  <span className="login-feature-icon">{f.icon}</span>
                  <div>
                    <p className="login-feature-label">{f.label}</p>
                    <p className="login-feature-sub">{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="login-stats">
              <div className="login-stat">
                <span className="login-stat-num">₹</span>
                <span className="login-stat-label">INR native</span>
              </div>
              <div className="login-stat-divider" />
              <div className="login-stat">
                <span className="login-stat-num">24/7</span>
                <span className="login-stat-label">Your dashboard</span>
              </div>
              <div className="login-stat-divider" />
              <div className="login-stat">
                <span className="login-stat-num">∞</span>
                <span className="login-stat-label">Entries</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — login form */}
        <div className="login-panel">
          <div className="login-mobile-brand">
            <span className="login-mobile-brand-icon">💸</span>
            <span className="login-mobile-brand-text">FinTrack</span>
          </div>
          <div className="login-panel-glow" />

          <div className="login-form-wrap">
            <div className="login-form-header">
              <p className="login-form-eyebrow">Welcome back</p>
              <h2 className="login-form-title">Sign in to your account</h2>
              <p className="login-form-sub">Enter your email and password below</p>
            </div>

            {error && (
              <div className="login-error">
                <span>✕</span> {error}
              </div>
            )}

            {unverifiedEmail && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="btn-secondary w-full !text-sm"
                >
                  {resendLoading ? "Sending..." : "Resend verification email"}
                </button>
                {resendMsg && (
                  <p className="text-xs text-center text-emerald-400">{resendMsg}</p>
                )}
              </div>
            )}

            <form onSubmit={handleLogin} className="login-form">
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
                  autoComplete="email"
                />
              </div>

              <div className={`login-field ${focused === "password" ? "login-field-active" : ""}`}>
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <button type="submit" disabled={loading} className="login-submit">
                <span className="login-submit-text">
                  {loading ? "Signing in..." : "Sign in"}
                </span>
                <span className="login-submit-arrow">→</span>
                <span className="login-submit-shine" />
              </button>

              <SlowLoadHint
                active={loading}
                compact
                message="Connecting to server… Free database clusters can take 30–60 seconds to wake up after idle time."
              />
            </form>

            <div className="login-footer">
              <span>New to FinTrack?</span>
              <button type="button" onClick={() => navigate("/register")}>
                Create account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
