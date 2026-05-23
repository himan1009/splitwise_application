// const router = require("express").Router();
// const auth = require("../middleware/auth.middleware");
// const c = require("../controllers/expense.controller");

// router.post("/", auth, c.addExpense);
// router.get("/:groupId", auth, c.getExpenses);

// module.exports = router;



const router = require("express").Router();
const auth = require("../middleware/auth");
const c = require("../controllers/expense.controller");

router.post("/", auth, c.addExpense);
router.get("/:groupId", auth, c.getExpenses);

module.exports = router;
