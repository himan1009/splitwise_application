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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <p className="text-xs text-slate-500 font-medium">
          © {new Date().getFullYear()} FinTrack
        </p>
        <button
          onClick={deleteAccount}
          className="text-xs text-slate-500 hover:text-red-400 font-medium transition"
        >
          Delete Account
        </button>
      </div>
    </footer>
  );
}
