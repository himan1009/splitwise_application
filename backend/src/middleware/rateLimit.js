const buckets = new Map();

function clientKey(req, prefix) {
  const forwarded = req.headers["x-forwarded-for"];
  const ip =
    (typeof forwarded === "string" ? forwarded.split(",")[0].trim() : null) ||
    req.socket?.remoteAddress ||
    "unknown";
  return `${prefix}:${ip}`;
}

function rateLimit({ windowMs = 15 * 60 * 1000, max = 40, message = "Too many requests. Try again later." }) {
  return (req, res, next) => {
    const key = clientKey(req, req.rateLimitPrefix || "rl");
    const now = Date.now();
    let bucket = buckets.get(key);

    if (!bucket || now - bucket.start >= windowMs) {
      bucket = { start: now, count: 0 };
      buckets.set(key, bucket);
    }

    bucket.count += 1;

    if (bucket.count > max) {
      const retryAfter = Math.ceil((bucket.start + windowMs - now) / 1000);
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).json({ message });
    }

    next();
  };
}

module.exports = rateLimit;