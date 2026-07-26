import {
  formatDayLabel,
  formatTime,
  getTimestamp,
  toLocalDateKey,
} from "./format";

export function normalizeId(id) {
  if (!id) return "";
  if (typeof id === "object") {
    if (id._id) return String(id._id);
    if (id.id) return String(id.id);
    return "";
  }
  return String(id);
}

export function isSameUser(a, b) {
  return normalizeId(a) === normalizeId(b);
}

export function getDebtTimestamp(d) {
  return getTimestamp(d.recordedAt, d.createdAt || d.date);
}

export const formatDebtTime = formatTime;
export const formatDebtDayLabel = formatDayLabel;

export function sortDebtsByRecent(debts) {
  return [...debts].sort((a, b) => getDebtTimestamp(b) - getDebtTimestamp(a));
}

function safeDateKey(value) {
  return toLocalDateKey(value);
}

export function getEntryTimestamp(entry) {
  return getTimestamp(entry.date, entry.createdAt);
}

export function sortEntriesByRecent(entries) {
  return [...entries].sort((a, b) => getEntryTimestamp(b) - getEntryTimestamp(a));
}

export function calculateDebtNet(history, myId) {
  let total = 0;
  const me = normalizeId(myId);

  history.forEach((d) => {
    const amt = Number(d.amount);
    const isSettlement = d.type === "settlement";

    if (isSettlement) {
      if (isSameUser(d.to, me)) {
        total -= amt;
      } else {
        total += amt;
      }
      return;
    }

    if (isSameUser(d.from, me)) {
      total -= amt;
    } else {
      total += amt;
    }
  });

  return total;
}

export function getDebtEntryMeta(d, myId) {
  const isSettlement = d.type === "settlement";
  const me = normalizeId(myId);
  const recorder = getDebtRecorder(d);
  const recordedByMe = recorder && isSameUser(recorder, me);
  const recorderName = typeof recorder === "object" ? recorder?.name : null;

  if (isSettlement) {
    if (isSameUser(d.to, me)) {
      return {
        label: recordedByMe
          ? "Payment received (you recorded)"
          : recorderName
          ? `Payment received (recorded by ${recorderName})`
          : "Payment received",
        direction: "in",
        sign: "+",
        colorClass: "text-cyan-400",
        recordedByMe,
        recorderName,
      };
    }
    return {
      label: recordedByMe
        ? "Payment sent (you recorded)"
        : recorderName
        ? `Payment sent (recorded by ${recorderName})`
        : "Payment sent",
      direction: "out",
      sign: "−",
      colorClass: "text-violet-400",
      recordedByMe,
      recorderName,
    };
  }

  if (isSameUser(d.to, me)) {
    return {
      label: recordedByMe
        ? "You lent money (you recorded)"
        : recorderName
        ? `You lent money (recorded by ${recorderName})`
        : "You lent money",
      direction: "loan-out",
      sign: "+",
      colorClass: "text-emerald-400",
      recordedByMe,
      recorderName,
    };
  }

  return {
    label: recordedByMe
      ? "You borrowed money (you recorded)"
      : recorderName
      ? `You borrowed money (recorded by ${recorderName})`
      : "You borrowed money",
    direction: "loan-in",
    sign: "−",
    colorClass: "text-red-400",
    recordedByMe,
    recorderName,
  };
}

export function groupDebtsByDate(history) {
  const groups = {};

  history.forEach((d) => {
    const dateKey = safeDateKey(d.recordedAt || d.createdAt || d.date);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(d);
  });

  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, entries]) => ({
      date,
      label: formatDayLabel(date),
      entries: sortDebtsByRecent(entries),
    }));
}

export function getRecentDebtsByDate(history, limit = 12) {
  const grouped = groupDebtsByDate(history);
  const collected = [];
  const result = [];

  for (const day of grouped) {
    const dayEntries = [];
    for (const entry of day.entries) {
      if (collected.length >= limit) break;
      collected.push(entry);
      dayEntries.push(entry);
    }
    if (dayEntries.length) {
      result.push({ ...day, entries: dayEntries });
    }
    if (collected.length >= limit) break;
  }

  return result;
}

export function groupEntriesByDate(entries) {
  const groups = {};

  entries.forEach((entry) => {
    const dateKey = safeDateKey(entry.date || entry.createdAt);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(entry);
  });

  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({
      date,
      label: formatDayLabel(date),
      entries: sortEntriesByRecent(items),
    }));
}

export function getDebtRecorder(d) {
  return d?.recordedBy || d?.settledBy || null;
}

export function getDebtRecorderId(d) {
  const recorder = getDebtRecorder(d);
  if (!recorder) return "";
  return normalizeId(recorder);
}

export function canModifyDebtEntry(d, myId) {
  const recorderId = getDebtRecorderId(d);
  if (!recorderId) return false;
  return isSameUser(recorderId, myId);
}

export function canDeleteDebtEntry(d, myId) {
  return canModifyDebtEntry(d, myId);
}

export function canEditDebtEntry(d, myId) {
  return canModifyDebtEntry(d, myId);
}

export function summarizeDebtsByPerson(debts, myId) {
  const map = {};
  const me = normalizeId(myId);

  debts.forEach((d) => {
    const otherUser = isSameUser(d.from, me) ? d.to : d.from;
    const otherId = normalizeId(otherUser._id ?? otherUser);

    if (!map[otherId]) {
      map[otherId] = {
        _id: otherId,
        name: otherUser.name,
        amount: 0,
        txCount: 0,
        lastActivityAt: 0,
      };
    }

    const isSettlement = d.type === "settlement";
    const amt = Number(d.amount);
    map[otherId].txCount += 1;
    map[otherId].lastActivityAt = Math.max(
      map[otherId].lastActivityAt,
      getDebtTimestamp(d)
    );

    if (isSettlement) {
      if (isSameUser(d.to, me)) {
        map[otherId].amount -= amt;
      } else {
        map[otherId].amount += amt;
      }
    } else if (isSameUser(d.from, me)) {
      map[otherId].amount -= amt;
    } else {
      map[otherId].amount += amt;
    }
  });

  return Object.values(map).sort((a, b) => {
    if (b.lastActivityAt !== a.lastActivityAt) {
      return b.lastActivityAt - a.lastActivityAt;
    }
    const aActive = Math.abs(a.amount) >= 0.01;
    const bActive = Math.abs(b.amount) >= 0.01;
    if (aActive !== bActive) return aActive ? -1 : 1;
    return Math.abs(b.amount) - Math.abs(a.amount);
  });
}
