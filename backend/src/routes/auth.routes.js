// const router = require("express").Router();
// const c = require("../controllers/auth.controller");

// router.post("/register", c.register);
// router.post("/login", c.login);

// module.exports = router;



// const router = require("express").Router();
// const auth = require("../middleware/auth");
// const c = require("../controllers/auth.controller");

// router.post("/register", c.register);
// router.post("/login", c.login);
// router.get("/users", auth, c.getUsers);
// router.delete("/delete-account", auth, c.deleteAccount);

// module.exports = router;


// const express = require("express");
// const router = express.Router();
// const authController = require("../controllers/auth.controller");
// const auth = require("../middleware/auth");

// /* PUBLIC */
// router.post("/register", authController.register);
// router.post("/login", authController.login);

// /* PROTECTED */
// router.delete("/delete-account", auth, async (req, res) => {
//   try {
//     await req.user.deleteOne();
//     res.json({ message: "Account deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to delete account" });
//   }
// });

// module.exports = router;



const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const auth = require("../middleware/auth");

router.post("/register", authController.register);
router.post("/login", authController.login);

/* delete account */
router.delete("/delete-account", auth, async (req, res) => {
  try {
    await req.user.deleteOne();
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete account" });
  }
});

module.exports = router;
