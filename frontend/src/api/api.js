import axios from "axios";
import { clearSession } from "../utils/auth";

function resolveApiBaseUrl() {
  const raw = (import.meta.env.VITE_API_URL || "http://localhost:5000").trim();
  if (!raw) return "http://localhost:5000";
  const withoutTrailingSlash = raw.replace(/\/+$/, "");
  if (/^https?:\/\//i.test(withoutTrailingSlash)) {
    return withoutTrailingSlash;
  }
  // Hosting dashboards often paste the host without a scheme; axios would treat that as a relative path.
  return `https://${withoutTrailingSlash}`;
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 90000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSession();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
