import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* LOGO */}
        <h1
          onClick={() => navigate("/groups")}
          className="text-2xl font-bold text-blue-600 cursor-pointer"
        >
          Splitwise 💸
        </h1>

        {/* USER INFO */}
        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">
                {user.name}
              </p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>

            <button
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
