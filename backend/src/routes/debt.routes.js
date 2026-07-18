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
    const { from, to, amount, description, recordedAt } = req.body;

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

    let recordedAtDate = new Date();
    if (recordedAt) {
      const parsedRecordedAt = new Date(recordedAt);
      if (Number.isNaN(parsedRecordedAt.getTime())) {
        return res.status(400).json({ message: "Invalid recordedAt date" });
      }
      recordedAtDate = parsedRecordedAt;
    }

    const debt = await Debt.create({
      from,
      to,
      amount: parseFloat(amt.toFixed(2)),
      description: description || "No description",
      type: "loan",
      recordedAt: recordedAtDate,
    });

    const populated = await Debt.findById(debt._id)
      .populate("from", "name email")
      .populate("to", "name email")
      .populate("settledBy", "name email");

    res.status(201).json(populated);

  } catch (err) {
    res.status(500).json({ message: "Failed to add debt" });
  }
});


const calculateNet = (records, myId) => {
  let net = 0;
  const me = myId.toString();
  const idOf = (value) => (value?._id ?? value)?.toString();

  records.forEach((d) => {
    const amt = Number(d.amount);
    const isSettlement = d.type === "settlement";

    if (isSettlement) {
      if (idOf(d.to) === me) {
        net -= amt;
      } else {
        net += amt;
      }
    } else if (idOf(d.from) === me) {
      net -= amt;
    } else {
      net += amt;
    }
  });

  return net;
};

const buildSettlement = ({ otherUserId, myId, amount, full, date, recordedAt, note, records }) => {
  const net = calculateNet(records, myId);

  if (Math.abs(net) < 0.01) {
    const err = new Error("Already settled up");
    err.status = 400;
    throw err;
  }

  let settleAmount = full ? Math.abs(net) : Number(amount);

  if (isNaN(settleAmount) || settleAmount <= 0) {
    const err = new Error("Enter a valid settlement amount");
    err.status = 400;
    throw err;
  }

  if (settleAmount > Math.abs(net) + 0.01) {
    const err = new Error(
      `Amount cannot exceed outstanding balance of ₹${Math.abs(net).toFixed(2)}`
    );
    err.status = 400;
    throw err;
  }

  settleAmount = parseFloat(settleAmount.toFixed(2));

  let from;
  let to;
  let description;

  if (net > 0) {
    from = otherUserId;
    to = myId;
    description =
      note?.trim() ||
      (full
        ? `Full settlement — returned ${settleAmount}`
        : `Partial settlement — returned ${settleAmount}`);
  } else {
    from = myId;
    to = otherUserId;
    description =
      note?.trim() ||
      (full
        ? `Full settlement — paid ${settleAmount}`
        : `Partial settlement — paid ${settleAmount}`);
  }

  let recordedAtDate = new Date();
  if (recordedAt) {
    const parsedRecordedAt = new Date(recordedAt);
    if (Number.isNaN(parsedRecordedAt.getTime())) {
      const err = new Error("Invalid recordedAt date");
      err.status = 400;
      throw err;
    }
    recordedAtDate = parsedRecordedAt;
  } else if (date) {
    const parsed = new Date(date);
    if (!Number.isNaN(parsed.getTime())) {
      parsed.setHours(12, 0, 0, 0);
      recordedAtDate = parsed;
    }
  }

  return {
    from,
    to,
    amount: settleAmount,
    description,
    type: "settlement",
    settledBy: myId,
    recordedAt: recordedAtDate,
  };
};

/* ================= SETTLE DEBT (PARTIAL OR FULL) ================= */
router.post("/settle", auth, async (req, res) => {
  try {
    const { otherUserId, amount, full, date, recordedAt, note } = req.body;
    const myId = req.user._id;

    if (!otherUserId || !mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (otherUserId.toString() === myId.toString()) {
      return res.status(400).json({ message: "Cannot settle with yourself" });
    }

    const records = await Debt.find({
      $or: [
        { from: myId, to: otherUserId },
        { from: otherUserId, to: myId },
      ],
    });

    const settlement = buildSettlement({
      otherUserId,
      myId,
      amount,
      full,
      date,
      recordedAt,
      note,
      records,
    });

    const debt = await Debt.create(settlement);

    const populated = await Debt.findById(debt._id)
      .populate("from", "name email")
      .populate("to", "name email")
      .populate("settledBy", "name email");

    res.status(201).json(populated);
  } catch (err) {
    console.error("SETTLE DEBT ERROR:", err);
    const status = err.status || 500;
    res.status(status).json({
      message: err.message || "Failed to record settlement",
    });
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
      .populate("settledBy", "name email")
      .sort({ recordedAt: -1, createdAt: -1 });

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
        { from: otherId, to: myId },
      ],
    })
      .populate("from", "name email")
      .populate("to", "name email")
      .populate("settledBy", "name email")
      .sort({ recordedAt: -1, createdAt: -1 });

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

    if (!mongoose.Types.ObjectId.isValid(otherId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

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

    if (debt.type === "settlement" && debt.settledBy) {
      if (debt.settledBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: "Only the person who recorded this settlement can delete it",
        });
      }
    }

    await debt.deleteOne();

    res.json({ message: "Debt deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: "Failed to delete debt" });
  }
});

module.exports = router;