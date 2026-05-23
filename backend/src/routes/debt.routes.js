// const router = require("express").Router();
// const auth = require("../middleware/auth");
// const Debt = require("../models/Debt");

// router.post("/", auth, async (req, res) => {
//   try {
//     const { from, to, amount, description } = req.body;

//     if (!from || !to || !amount) {
//       return res.status(400).json({ message: "Invalid data" });
//     }

//     const debt = await Debt.create({
//       from,
//       to,
//       amount,
//       description
//     });

//     const populated = await Debt.findById(debt._id)
//       .populate("from", "name")
//       .populate("to", "name");

//     res.json(populated);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to add debt" });
//   }
// });

// router.get("/", auth, async (req, res) => {
//   const debts = await Debt.find({
//     $or: [{ from: req.user._id }, { to: req.user._id }]
//   })
//     .populate("from", "name")
//     .populate("to", "name")
//     .sort({ createdAt: -1 });

//   res.json(debts);
// });

// router.get("/with/:userId", auth, async (req, res) => {
//   const myId = req.user._id;
//   const otherId = req.params.userId;

//   const records = await Debt.find({
//     $or: [
//       { from: myId, to: otherId },
//       { from: otherId, to: myId }
//     ]
//   })
//     .populate("from", "name")
//     .populate("to", "name")
//     .sort({ createdAt: -1 });

//   res.json(records);
// });

// module.exports = router;



const router = require("express").Router();
const auth = require("../middleware/auth");
const Debt = require("../models/Debt");
const mongoose = require("mongoose");

/* ================= ADD DEBT ================= */
router.post("/", auth, async (req, res) => {
  try {
    const { from, to, amount, description } = req.body;

    if (!from || !to || !amount) {
      return res.status(400).json({ message: "Invalid data" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(from) ||
      !mongoose.Types.ObjectId.isValid(to)
    ) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // 🔥 SECURITY: logged in user must be either from or to
    if (
      from.toString() !== req.user._id.toString() &&
      to.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Invalid transaction" });
    }

    if (from.toString() === to.toString()) {
      return res.status(400).json({ message: "Cannot create debt with yourself" });
    }

    const amt = Number(amount);

    if (isNaN(amt) || amt <= 0) {
      return res.status(400).json({ message: "Amount must be positive" });
    }

    const debt = await Debt.create({
      from,
      to,
      amount: parseFloat(amt.toFixed(2)),
      description: description || "No description"
    });

    const populated = await Debt.findById(debt._id)
      .populate("from", "name email")
      .populate("to", "name email");

    res.status(201).json(populated);

  } catch (err) {
    res.status(500).json({ message: "Failed to add debt" });
  }
});


/* ================= GET ALL MY DEBTS ================= */
router.get("/", auth, async (req, res) => {
  try {
    const debts = await Debt.find({
      $or: [{ from: req.user._id }, { to: req.user._id }]
    })
      .populate("from", "name email")
      .populate("to", "name email")
      .sort({ createdAt: -1 });

    res.json(debts);

  } catch (err) {
    console.error("GET DEBTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch debts" });
  }
});

/* ================= GET DEBT WITH ONE USER ================= */
router.get("/with/:userId", auth, async (req, res) => {
  try {
    const myId = req.user._id;
    const otherId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(otherId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const records = await Debt.find({
      $or: [
        { from: myId, to: otherId },
        { from: otherId, to: myId }
      ]
    })
      .populate("from", "name email")
      .populate("to", "name email")
      .sort({ createdAt: -1 });

    res.json(records);

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
});


/* ================= DELETE ALL WITH USER ================= */
router.delete("/all-with/:userId", auth, async (req, res) => {
  try {
    const myId = req.user._id;
    const otherId = req.params.userId;

    await Debt.deleteMany({
      $or: [
        { from: myId, to: otherId },
        { from: otherId, to: myId }
      ]
    });

    res.json({ message: "All records deleted" });

  } catch (err) {
    res.status(500).json({ message: "Failed to delete records" });
  }
});


/* ================= DELETE SINGLE DEBT ================= */
router.delete("/:id", auth, async (req, res) => {
  try {
    const debt = await Debt.findById(req.params.id);

    if (!debt) {
      return res.status(404).json({ message: "Debt not found" });
    }

    if (
      debt.from.toString() !== req.user._id.toString() &&
      debt.to.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await debt.deleteOne();

    res.json({ message: "Debt deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: "Failed to delete debt" });
  }
});

module.exports = router;