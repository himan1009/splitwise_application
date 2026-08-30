export function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getStoredUserId() {
  const user = getStoredUser();
  return user?._id || user?.id || null;
}

export function updateStoredUser(user) {
  if (!user) return;
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function hasStoredSession() {
  return Boolean(localStorage.getItem("token") && getStoredUser());
}

export function getSafeReturnPath(path) {
  if (!path || typeof path !== "string") return "/tracker";
  if (!path.startsWith("/") || path.startsWith("//")) return "/tracker";
  if (
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/check-email") ||
    path.startsWith("/verify-email") ||
    path.startsWith("/confirm-email-change")
  ) {
    return "/tracker";
  }
  return path;
}
