import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  const deleteAccount = async () => {
    const confirm = window.confirm(
      "Are you sure? This will permanently delete your account and all data."
    );
    if (!confirm) return;

    try {
      await api.delete("/auth/delete-account");

      // clear local storage
      localStorage.clear();

      // redirect to login
      navigate("/login", { replace: true });
    } catch (err) {
      alert("Failed to delete account. Please try again.");
      console.error(err);
    }
  };

  return (
    <footer className="bg-gray-100 border-t mt-10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Splitwise Clone
        </p>

        <button
          onClick={deleteAccount}
          className="text-sm text-red-600 hover:underline"
        >
          Delete Account
        </button>
      </div>
    </footer>
  );
}
