import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/api";
import { getApiErrorMessage } from "../utils/apiErrors";

export default function CheckEmail() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const resend = async () => {
    if (!email) {
      setError("Email address missing. Go back to register.");
      return;
    }
    setLoading(true);
    setError("");
    setMsg("");
    try {
      const res = await api.post("/auth/resend-verification", { email });
      setMsg(res.data.message);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not resend email"));
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
              <p className="text-4xl mb-3">📧</p>
              <h2 className="login-form-title">Check your email</h2>
              <p className="login-form-sub">
                We sent a verification link to{" "}
                <strong className="text-slate-200">{email || "your email"}</strong>.
                Click it to activate your account, then sign in.
              </p>
            </div>

            {msg && <div className="login-error !border-emerald-500/30 !bg-emerald-500/10 !text-emerald-300"><span>✓</span> {msg}</div>}
            {error && <div className="login-error"><span>✕</span> {error}</div>}

            <div className="space-y-3 mt-6">
              <button type="button" onClick={resend} disabled={loading} className="login-submit w-full">
                <span className="login-submit-text">{loading ? "Sending..." : "Resend verification email"}</span>
              </button>
              <button type="button" onClick={() => navigate("/login")} className="btn-secondary w-full">
                Go to sign in
              </button>
            </div>

            <p className="text-xs text-dim text-center mt-6">
              Used a wrong email?{" "}
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300">
                Register again
              </Link>{" "}
              with the correct one.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
