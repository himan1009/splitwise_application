function requireEnv(name) {
  const value = process.env[name];
  if (!value || !String(value).trim()) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

function validateEnv() {
  requireEnv("MONGO_URI");
  const secret = requireEnv("JWT_SECRET");
  if (secret.length < 8) {
    console.error("JWT_SECRET must be at least 8 characters long");
    process.exit(1);
  }
}

module.exports = { validateEnv };
