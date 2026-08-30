import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/api";
import { getApiErrorMessage } from "../utils/apiErrors";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    api
      .get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((res) => {
        setStatus("success");
        setMessage(res.data.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(getApiErrorMessage(err, "Verification failed"));
      });
  }, [token]);

  return (
    <div className="login-world">
      <div className="login-grid" />
      <div className="login-shell login-shell-single">
        <div className="login-panel">
          <div className="login-form-wrap text-center">
            <p className="text-4xl mb-4">{status === "loading" ? "⏳" : status === "success" ? "✅" : "❌"}</p>
            <h2 className="login-form-title">
              {status === "loading" ? "Verifying..." : status === "success" ? "Email verified!" : "Verification failed"}
            </h2>
            <p className="login-form-sub mt-3">{status === "loading" ? "Please wait a moment." : message}</p>
            {status !== "loading" && (
              <button type="button" onClick={() => navigate("/login")} className="login-submit w-full mt-8">
                <span className="login-submit-text">Sign in</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
