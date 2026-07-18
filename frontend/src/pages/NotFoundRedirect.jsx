import { Navigate } from "react-router-dom";
import { hasStoredSession } from "../utils/auth";

export default function NotFoundRedirect() {
  return <Navigate to={hasStoredSession() ? "/tracker" : "/login"} replace />;
}
