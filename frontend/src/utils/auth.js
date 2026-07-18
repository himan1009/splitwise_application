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

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function hasStoredSession() {
  return Boolean(localStorage.getItem("token") && getStoredUser());
}
