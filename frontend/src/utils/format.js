export const formatCurrency = (amount) =>
  `₹${Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

export const formatMonth = (monthStr) => {
  const [year, month] = monthStr.split("-");
  const date = new Date(year, month - 1);
  return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
};

export const formatDate = (dateStr) => {
  if (typeof dateStr === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

export const getNowDateString = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const getNowTimeString = () => {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `${h}:${min}`;
};

/** Local calendar date as YYYY-MM-DD (not UTC). */
export const toLocalDateKey = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return getNowDateString();

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/** Sensible default time when user picks a date in forms. */
export const getDefaultTimeForDate = (dateStr) => {
  if (dateStr === getNowDateString()) return getNowTimeString();
  return "12:00";
};

export const getLocalTimezoneLabel = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offsetMin = -new Date().getTimezoneOffset();
    const sign = offsetMin >= 0 ? "+" : "-";
    const abs = Math.abs(offsetMin);
    const hours = String(Math.floor(abs / 60)).padStart(2, "0");
    const mins = String(abs % 60).padStart(2, "0");
    return `${tz} (UTC${sign}${hours}:${mins})`;
  } catch {
    return "local time";
  }
};

export const splitDateTime = (dateValue) => {
  if (!dateValue) {
    return { date: getNowDateString(), time: getNowTimeString() };
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return { date: getNowDateString(), time: getNowTimeString() };
  }

  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, "0");
  const d = String(parsed.getDate()).padStart(2, "0");
  const h = String(parsed.getHours()).padStart(2, "0");
  const min = String(parsed.getMinutes()).padStart(2, "0");

  return { date: `${y}-${m}-${d}`, time: `${h}:${min}` };
};

export const combineDateAndTime = (dateStr, timeStr) => {
  if (!dateStr) return new Date().toISOString();

  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = (timeStr || "12:00").split(":").map(Number);

  return new Date(year, month - 1, day, hours, minutes, 0, 0).toISOString();
};

export const formatTime = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
};

export const formatDateTime = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const formatDayLabel = (dateKey) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateKey + "T12:00:00");
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today - target) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return target.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const getTimestamp = (primary, fallback) =>
  new Date(primary || fallback).getTime();

export const formatDayNumber = (dateStr) => {
  if (typeof dateStr === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return Number(dateStr.split("-")[2]);
  }
  return new Date(dateStr).getDate();
};

export const getCurrentMonth = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

export const shiftMonth = (monthStr, delta) => {
  const [year, month] = monthStr.split("-").map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

export const getDaysInMonth = (monthStr) => {
  const [year, month] = monthStr.split("-").map(Number);
  return new Date(year, month, 0).getDate();
};

export const getFirstDayOfMonth = (monthStr) => {
  const [year, month] = monthStr.split("-").map(Number);
  return new Date(year, month - 1, 1).getDay();
};

export const toDateString = (year, month, day) => {
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
};
