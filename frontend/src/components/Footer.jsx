import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Footer({ setIsAuthenticated }) {
  const navigate = useNavigate();

  const deleteAccount = async () => {
    const confirm = window.confirm(
      "Are you sure? This will permanently delete your account and all data."
    );
    if (!confirm) return;

    try {
      await api.delete("/auth/delete-account");
      localStorage.clear();
      if (setIsAuthenticated) setIsAuthenticated(false);
      navigate("/login", { replace: true });
    } catch (err) {
      alert("Failed to delete account. Please try again.");
      console.error(err);
    }
  };

  return (
    <footer className="app-footer mt-auto">
      <div className="app-footer-inner max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center gap-3">
        <p className="text-xs text-slate-500 font-medium shrink-0">
          © {new Date().getFullYear()} FinTrack
        </p>
        <button
          onClick={deleteAccount}
          className="text-xs text-slate-500 hover:text-red-400 font-medium transition py-2 px-3 min-h-[44px] rounded-lg touch-target"
        >
          Delete Account
        </button>
      </div>
    </footer>
  );
}
