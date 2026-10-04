const mongoose = require("mongoose");

const INTERVAL_MS = 8 * 60 * 1000;
const HTTP_TIMEOUT_MS = 20000;
const MONGO_PING_TIMEOUT_MS = 8000;

let started = false;
let ticking = false;
let intervalId = null;
let startupId = null;

function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function normalizeHealthUrl(raw) {
  if (!raw || typeof raw !== "string") return null;
  let url = raw.trim();
  if (!url) return null;
  url = url.replace(/\/$/, "");
  if (!/^https?:\/\//i.test(url)) return null;
  if (!/\/health$/i.test(url)) {
    url = `${url}/health`;
  }
  return url;
}

function getKeepAliveUrl() {
  return (
    normalizeHealthUrl(process.env.KEEP_ALIVE_URL) ||
    normalizeHealthUrl(process.env.RENDER_EXTERNAL_URL)
  );
}

function isLocalUrl(url) {
  try {
    const host = new URL(url).hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return true;
  }
}

async function pingMongo() {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    return;
  }
  await withTimeout(
    mongoose.connection.db.command({ ping: 1 }),
    MONGO_PING_TIMEOUT_MS,
    "Mongo ping"
  );
}

async function pingHttp(url) {
  if (isLocalUrl(url) && process.env.NODE_ENV === "production") {
    return;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);
  try {
    await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: { Accept: "application/json" },
      redirect: "follow",
    });
  } finally {
    clearTimeout(timer);
  }
}

async function tick() {
  if (ticking) return;
  ticking = true;
  try {
    try {
      await pingMongo();
    } catch (err) {
      console.warn("[keep-alive] Mongo ping failed:", err.message);
    }

    const url = getKeepAliveUrl();
    if (!url) return;

    try {
      await pingHttp(url);
    } catch (err) {
      console.warn("[keep-alive] HTTP ping failed:", err.message);
    }
  } finally {
    ticking = false;
  }
}

function startKeepAlive() {
  if (started) return;
  started = true;

  const url = getKeepAliveUrl();
  if (url) {
    console.log("[keep-alive] Ping every 8 minutes:", url);
  } else {
    console.log("[keep-alive] Mongo ping every 8 minutes");
  }

  intervalId = setInterval(tick, INTERVAL_MS);
  startupId = setTimeout(tick, 20 * 1000);

  if (typeof intervalId.unref === "function") intervalId.unref();
  if (typeof startupId.unref === "function") startupId.unref();
}

function stopKeepAlive() {
  if (intervalId) clearInterval(intervalId);
  if (startupId) clearTimeout(startupId);
  intervalId = null;
  startupId = null;
  started = false;
  ticking = false;
}

module.exports = { startKeepAlive, stopKeepAlive, normalizeHealthUrl };
