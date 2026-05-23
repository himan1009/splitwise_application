// const Expense = require("../models/Expense");

// exports.addExpense = async (req, res) => {
//   try {
//     const expense = await Expense.create(req.body);
//     res.status(201).json(expense);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to add expense" });
//   }
// };

// exports.getExpenses = async (req, res) => {
//   try {
//     const expenses = await Expense.find({
//       groupId: req.params.groupId
//     })
//       .populate("paidBy", "name email")
//       .populate("splits.user", "name email")
//       .sort({ createdAt: -1 });

//     res.json(expenses);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch expenses" });
//   }
// };



// const Expense = require("../models/Expense");

// /* ADD EXPENSE */
// exports.addExpense = async (req, res) => {
//   const expense = await Expense.create(req.body);
//   res.json(expense);
// };

// /* GET EXPENSES BY GROUP */
// exports.getExpenses = async (req, res) => {
//   const expenses = await Expense.find({ group: req.params.groupId })
//     .populate("paidBy", "name")
//     .populate("splits.user", "name");
//   res.json(expenses);
// };



// const Expense = require("../models/Expense");

// /* ================= ADD EXPENSE ================= */
// exports.addExpense = async (req, res) => {
//   try {
//     const { groupId, description, amount, paidBy, splits } = req.body;

//     if (!groupId || !description || !amount || !paidBy || !splits?.length) {
//       return res.status(400).json({ message: "Invalid expense data" });
//     }

//     const expense = await Expense.create({
//       groupId,
//       description,
//       amount,
//       paidBy,
//       splits
//     });

//     res.status(201).json(expense);
//   } catch (err) {
//     console.error("ADD EXPENSE ERROR:", err);
//     res.status(500).json({ message: "Failed to add expense" });
//   }
// };

// /* ================= GET EXPENSES (🔥 FIX HERE) ================= */
// exports.getExpenses = async (req, res) => {
//   try {
//     const { groupId } = req.params;

//     const expenses = await Expense.find({ groupId })
//       .populate("paidBy", "name email")          // ✅ REQUIRED
//       .populate("splits.user", "name email")     // ✅ REQUIRED
//       .sort({ createdAt: -1 });

//     res.json(expenses);
//   } catch (err) {
//     console.error("GET EXPENSES ERROR:", err);
//     res.status(500).json({ message: "Failed to fetch expenses" });
//   }
// };


const Expense = require("../models/Expense");

/* ================= ADD EXPENSE ================= */
exports.addExpense = async (req, res) => {
  try {
    const { groupId, description, amount, splits } = req.body;

    if (!groupId || !description || !amount || !splits?.length) {
      return res.status(400).json({ message: "Invalid expense data" });
    }

    // 🔒 Always take paidBy from auth middleware
    const paidBy = req.user._id;

    // 🔎 Validate splits total
    const totalSplit = splits.reduce(
      (sum, s) => sum + Number(s.amount),
      0
    );

    if (Math.abs(totalSplit - amount) > 0.01) {
      return res.status(400).json({
        message: "Split amounts do not match total expense"
      });
    }

    const expense = await Expense.create({
      groupId,
      description,
      amount,
      paidBy,
      splits
    });

    // Populate before returning
    const populatedExpense = await Expense.findById(expense._id)
      .populate("paidBy", "name email")
      .populate("splits.user", "name email");

    res.status(201).json(populatedExpense);
  } catch (err) {
    console.error("ADD EXPENSE ERROR:", err);
    res.status(500).json({ message: "Failed to add expense" });
  }
};

/* ================= GET EXPENSES ================= */
exports.getExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;

    const expenses = await Expense.find({ groupId })
      .populate("paidBy", "_id name email")        // ✅ REQUIRED
      .populate("splits.user", "_id name email")   // ✅ REQUIRED
      .sort({ createdAt: -1 });

    res.json(expenses);
  } catch (err) {
    console.error("GET EXPENSES ERROR:", err);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
};
