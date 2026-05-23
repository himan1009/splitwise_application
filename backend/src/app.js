const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", require("./routes/auth.routes"));
app.use("/groups", require("./routes/group.routes"));
app.use("/expenses", require("./routes/expense.routes"));
app.use("/debts", require("./routes/debt.routes"));
module.exports = app;
