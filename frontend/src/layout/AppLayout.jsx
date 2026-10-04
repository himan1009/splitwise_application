import { Outlet, useNavigate, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import api from "../api/api";
import { getStoredUser, clearSession, updateStoredUser } from "../utils/auth";
import { BrandMark, IconTracker, IconGroups, IconDebts } from "../components/ui/Icons";

const NAV_ITEMS = [
  { to: "/tracker", label: "Tracker", Icon: IconTracker, paths: ["/tracker"] },
  { to: "/groups", label: "Groups", Icon: IconGroups, paths: ["/groups", "/group", "/create-group"] },
  { to: "/debts", label: "Debts", Icon: IconDebts, paths: ["/debts", "/debt", "/add-debt"] },
];

function isNavActive(pathname, paths) {
  return paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export default function AppLayout({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(getStoredUser());

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.user);
        updateStoredUser(res.data.user);
      })
      .catch(() => {});
  }, []);

  const logout = () => {
    clearSession();
    if (setIsAuthenticated) setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <header className="app-header safe-top">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <button
              onClick={() => navigate("/tracker")}
              className="flex items-center gap-2.5 group shrink-0 touch-target"
              type="button"
            >
              <BrandMark size={32} />
              <span className="app-logo-text">FinTrack</span>
            </button>

            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={
                    isNavActive(location.pathname, item.paths)
                      ? "nav-pill-active nav-pill"
                      : "nav-pill-inactive nav-pill"
                  }
                >
                  <item.Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate("/account")}
                className="hidden lg:block text-right touch-target"
                aria-label="Account settings"
              >
                <p className="text-sm font-semibold text-slate-200">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/account")}
                className="app-avatar flex touch-target"
                aria-label="Account settings"
              >
                {user?.name?.charAt(0)?.toUpperCase() || "?"}
              </button>
              <button
                type="button"
                onClick={logout}
                className="btn-ghost !px-3 text-xs sm:text-sm touch-target min-h-[44px]"
                aria-label="Logout"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </header>

      {user?.needsEmailAttention && location.pathname !== "/account" && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
            <p className="text-amber-100">
              {user.pendingEmail
                ? `Confirm your new email (${user.pendingEmail}) from your inbox.`
                : "Add a real email so you can recover this account."}
            </p>
            <button
              type="button"
              onClick={() => navigate("/account")}
              className="text-amber-200 font-semibold hover:text-white shrink-0 text-left sm:text-right"
            >
              Open account
            </button>
          </div>
        </div>
      )}

      <main className="app-main app-main-with-nav">
        <Outlet />
      </main>

      <nav className="mobile-bottom-nav lg:hidden" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={`mobile-nav-item ${
              isNavActive(location.pathname, item.paths)
                ? "mobile-nav-item-active"
                : "mobile-nav-item-inactive"
            }`}
          >
            <span className="mobile-nav-icon" aria-hidden="true">
              <item.Icon className="w-5 h-5" />
            </span>
            <span className="mobile-nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <Footer setIsAuthenticated={setIsAuthenticated} />
    </div>
  );
}
