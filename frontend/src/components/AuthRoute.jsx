import { Navigate, useLocation } from "react-router-dom";
import { getSafeReturnPath, hasStoredSession } from "../utils/auth";

export default function GuestRoute({ children }) {
  if (hasStoredSession()) {
    return <Navigate to="/tracker" replace />;
  }
  return children;
}

export function ProtectedRoute({ isAuthenticated, children }) {
  const location = useLocation();

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/login?returnTo=${encodeURIComponent(returnTo)}`}
        replace
      />
    );
  }

  return children;
}

export function RootRedirect({ isAuthenticated }) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const returnTo = getSafeReturnPath(params.get("returnTo"));

  return <Navigate to={isAuthenticated ? returnTo : "/login"} replace />;
}
