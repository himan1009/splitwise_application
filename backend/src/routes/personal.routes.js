const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const c = require("../controllers/personal.controller");

router.use(auth);

router.get("/categories", c.getCategories);
router.post("/entries", c.createEntry);
router.get("/entries", c.getEntries);
router.put("/entries/:id", c.updateEntry);
router.delete("/entries/:id", c.deleteEntry);
router.get("/summary/monthly", c.getMonthlySummary);
router.get("/summary/daily", c.getDailySummary);
router.get("/summary/day", c.getDayDetail);

module.exports = router;
