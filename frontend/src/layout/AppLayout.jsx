import { Outlet, useNavigate, NavLink, useLocation } from "react-router-dom";
import Footer from "../components/Footer";
import { getStoredUser, clearSession } from "../utils/auth";

const NAV_ITEMS = [
  { to: "/tracker", label: "Tracker", icon: "📊", paths: ["/tracker"] },
  { to: "/groups", label: "Groups", icon: "👥", paths: ["/groups", "/group", "/create-group"] },
  { to: "/debts", label: "Debts", icon: "🤝", paths: ["/debts", "/debt", "/add-debt"] },
];

function isNavActive(pathname, paths) {
  return paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export default function AppLayout({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getStoredUser();

  const logout = () => {
    clearSession();
    if (setIsAuthenticated) setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <div className="app-bg-grid" />
      <div className="app-bg-aurora app-bg-aurora-1" />
      <div className="app-bg-aurora app-bg-aurora-2" />
      <div className="app-bg-aurora app-bg-aurora-3" />

      <header className="app-header">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <button
              onClick={() => navigate("/tracker")}
              className="flex items-center gap-2.5 group shrink-0 touch-target"
              type="button"
            >
              <div className="app-logo-icon">💸</div>
              <span className="app-logo-text">FinTrack</span>
            </button>

            <nav className="hidden md:flex items-center gap-1">
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
                  <span>{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden lg:block text-right">
                <p className="text-sm font-semibold text-slate-200">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <div className="app-avatar hidden sm:flex">
                {user?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <button
                type="button"
                onClick={logout}
                className="btn-ghost !px-3 text-xs sm:text-sm touch-target min-h-[44px]"
                aria-label="Logout"
              >
                <span className="sm:hidden">Logout</span>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="app-main app-main-with-nav">
        <Outlet />
      </main>

      <nav className="mobile-bottom-nav md:hidden" aria-label="Main navigation">
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
              {item.icon}
            </span>
            <span className="mobile-nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <Footer setIsAuthenticated={setIsAuthenticated} />
    </div>
  );
}
