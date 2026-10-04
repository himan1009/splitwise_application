import { useState, useEffect } from "react";
import api from "../api/api";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import SlowLoadHint from "../components/ui/SlowLoadHint";
import { getApiErrorMessage } from "../utils/apiErrors";
import { getSafeReturnPath } from "../utils/auth";
import { BrandMark } from "../components/ui/Icons";

export default function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resendMsg, setResendMsg] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.resetSuccess) {
      setSuccessMsg(location.state.resetSuccess);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

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
      <div className="login-noise" />

      <div className="login-shell">
        <div className="login-hero">
          <div className="login-hero-inner">
            <div className="login-badge">
              <span className="login-badge-dot" />
              Personal finance, kept simple
            </div>

            <h1 className="login-title">
              <span className="login-title-line">Fin</span>
              <span className="login-title-line login-title-accent">Track</span>
            </h1>

            <p className="login-tagline">
              Track spending, split group bills, and settle personal debts — all in one calm workspace.
            </p>

            <div className="login-features">
              {[
                { label: "Monthly tracker", sub: "Income, expenses, and day-by-day cash flow" },
                { label: "Group splits", sub: "Trips and shared costs without the spreadsheet" },
                { label: "Personal debts", sub: "Who owes whom, with a clear settlement trail" },
              ].map((f) => (
                <div key={f.label} className="login-feature-card">
                  <span className="login-feature-icon">•</span>
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
                <span className="login-stat-label">INR first</span>
              </div>
              <div className="login-stat-divider" />
              <div className="login-stat">
                <span className="login-stat-num">3</span>
                <span className="login-stat-label">Money views</span>
              </div>
              <div className="login-stat-divider" />
              <div className="login-stat">
                <span className="login-stat-num">Private</span>
                <span className="login-stat-label">Your data</span>
              </div>
            </div>
          </div>
        </div>

        <div className="login-panel">
          <div className="login-mobile-brand">
            <span className="login-mobile-brand-icon">
              <BrandMark size={32} />
            </span>
            <span className="login-mobile-brand-text">FinTrack</span>
          </div>
          <div className="login-panel-glow" />

          <div className="login-form-wrap">
            <div className="login-form-header">
              <p className="login-form-eyebrow">Welcome back</p>
              <h2 className="login-form-title">Sign in to your account</h2>
              <p className="login-form-sub">Enter your email and password below</p>
            </div>

            {successMsg && (
              <div className="login-success">
                <span>✓</span> {successMsg}
              </div>
            )}

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
                <div className="flex items-center justify-between mb-1">
                  <label>Password</label>
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-xs text-emerald-400 hover:text-emerald-300"
                  >
                    Forgot password?
                  </button>
                </div>
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
