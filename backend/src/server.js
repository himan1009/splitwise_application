require("dotenv").config();
const dns = require("dns");
const mongoose = require("mongoose");
const { validateEnv } = require("./config/env");
const app = require("./app");
const { startKeepAlive, stopKeepAlive } = require("./utils/keepAlive");

validateEnv();

const PORT = process.env.PORT || 5000;

dns.setServers(["8.8.8.8", "1.1.1.1"]);

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 15000,
    heartbeatFrequencyMS: 10000,
  })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      startKeepAlive();
    });
  })
  .catch((err) => {
    console.error("Mongo connection error:", err.message);
    process.exit(1);
  });

const shutdown = () => {
  stopKeepAlive();
  mongoose.connection.close(false).then(() => process.exit(0)).catch(() => process.exit(1));
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
