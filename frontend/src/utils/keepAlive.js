const INTERVAL_MS = 8 * 60 * 1000;
const PING_TIMEOUT_MS = 25000;

let started = false;
let inFlight = null;
let lastPingAt = 0;

function getHealthUrl() {
  const configured = (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");
  if (configured) return `${configured}/health`;
  if (import.meta.env.DEV) return "http://localhost:5000/health";
  return null;
}

async function pingHealth() {
  const url = getHealthUrl();
  if (!url) return;
  if (inFlight) return;

  const now = Date.now();
  if (now - lastPingAt < 15000) return;
  lastPingAt = now;

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
  inFlight = fetch(url, {
    method: "GET",
    cache: "no-store",
    signal: controller.signal,
  })
    .catch(() => {})
    .finally(() => {
      window.clearTimeout(timer);
      inFlight = null;
    });

  await inFlight;
}

export function startClientKeepAlive() {
  if (started || typeof window === "undefined") return;
  started = true;

  pingHealth();

  const timer = window.setInterval(() => {
    if (document.visibilityState === "visible") {
      pingHealth();
    }
  }, INTERVAL_MS);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      pingHealth();
    }
  });

  window.addEventListener("pagehide", () => {
    window.clearInterval(timer);
  });
}
