import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/api";
import { getApiErrorMessage } from "../utils/apiErrors";

export default function ConfirmEmailChange() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid confirmation link.");
      return;
    }

    api
      .get(`/auth/confirm-email-change?token=${encodeURIComponent(token)}`)
      .then((res) => {
        setStatus("success");
        setMessage(res.data.message);
        setNewEmail(res.data.email || "");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(getApiErrorMessage(err, "Could not confirm email change"));
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
              {status === "loading" ? "Confirming..." : status === "success" ? "Email updated!" : "Update failed"}
            </h2>
            <p className="login-form-sub mt-3">{status === "loading" ? "Please wait." : message}</p>
            {newEmail && status === "success" && (
              <p className="text-sm text-cyan-400 mt-2">New email: {newEmail}</p>
            )}
            {status !== "loading" && (
              <button type="button" onClick={() => navigate("/login")} className="login-submit w-full mt-8">
                <span className="login-submit-text">Sign in with new email</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
