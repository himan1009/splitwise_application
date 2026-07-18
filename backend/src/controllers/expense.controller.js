const Expense = require("../models/Expense");
const Group = require("../models/Group");
const mongoose = require("mongoose");

const populateExpense = (query) =>
  query.populate("paidBy", "_id name email").populate("splits.user", "_id name email");

const assertGroupMember = async (groupId, userId) => {
  const group = await Group.findOne({ _id: groupId, members: userId });
  return group;
};

const parseRecordedAt = (value) => {
  if (!value) return new Date();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
};

const validateSplits = (splits, amount, group) => {
  if (!splits?.length) {
    return "At least one split is required";
  }

  const totalAmount = Number(amount);
  if (Number.isNaN(totalAmount) || totalAmount <= 0) {
    return "Amount must be greater than 0";
  }

  const totalSplit = splits.reduce((sum, s) => sum + Number(s.amount), 0);
  if (Math.abs(totalSplit - totalAmount) > 0.01) {
    return "Split amounts do not match total expense";
  }

  const seen = new Set();
  for (const split of splits) {
    const userId = split.user?.toString();
    if (!userId) {
      return "Invalid split member";
    }
    if (seen.has(userId)) {
      return "Duplicate split member";
    }
    seen.add(userId);

    const isMember = group.members.some((m) => m.toString() === userId);
    if (!isMember) {
      return "Invalid split member";
    }

    if (Number(split.amount) < 0) {
      return "Split amounts must be non-negative";
    }
  }

  return null;
};

const calculatePairBalance = (expenses, myId, otherId) => {
  const me = myId.toString();
  const other = otherId.toString();
  let net = 0;

  expenses.forEach((exp) => {
    const payerId = (exp.paidBy?._id || exp.paidBy).toString();

    exp.splits.forEach((split) => {
      const uid = (split.user?._id || split.user).toString();
      const amt = Number(split.amount);

      if (payerId === me && uid === other) {
        net += amt;
      }
      if (payerId === other && uid === me) {
        net -= amt;
      }
    });
  });

  return net;
};

/* ================= SETTLE GROUP BALANCE ================= */
exports.settleGroup = async (req, res) => {
  try {
    const { groupId, otherUserId, amount, full, recordedAt, note } = req.body;
    const myId = req.user._id;

    if (!groupId || !otherUserId) {
      return res.status(400).json({ message: "groupId and otherUserId are required" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(groupId) ||
      !mongoose.Types.ObjectId.isValid(otherUserId)
    ) {
      return res.status(400).json({ message: "Invalid group or user ID" });
    }

    const group = await assertGroupMember(groupId, myId);
    if (!group) {
      return res.status(403).json({ message: "Not authorized for this group" });
    }

    const isOtherMember = group.members.some(
      (m) => m.toString() === otherUserId.toString()
    );
    if (!isOtherMember) {
      return res.status(400).json({ message: "User is not in this group" });
    }

    if (otherUserId.toString() === myId.toString()) {
      return res.status(400).json({ message: "Cannot settle with yourself" });
    }

    const expenses = await Expense.find({ groupId });
    const net = calculatePairBalance(expenses, myId, otherUserId);

    if (Math.abs(net) < 0.01) {
      return res.status(400).json({ message: "Already settled up in this group" });
    }

    if (net > 0) {
      return res.status(400).json({
        message:
          "Only the person who owes can record a payment. Ask them to settle from their account.",
      });
    }

    let settleAmount = full ? Math.abs(net) : Number(amount);

    if (isNaN(settleAmount) || settleAmount <= 0) {
      return res.status(400).json({ message: "Enter a valid settlement amount" });
    }

    if (settleAmount > Math.abs(net) + 0.01) {
      return res.status(400).json({
        message: `Amount cannot exceed outstanding balance of ₹${Math.abs(net).toFixed(2)}`,
      });
    }

    settleAmount = parseFloat(settleAmount.toFixed(2));

    const paidBy = myId;
    const splits = [{ user: otherUserId, amount: settleAmount }];
    const description =
      note?.trim() ||
      (full
        ? `Group settlement — paid ₹${settleAmount}`
        : `Group settlement — paid ₹${settleAmount} (partial)`);

    const parsedRecordedAt = parseRecordedAt(recordedAt);
    if (recordedAt && !parsedRecordedAt) {
      return res.status(400).json({ message: "Invalid recordedAt date" });
    }

    const expense = await Expense.create({
      groupId,
      type: "settlement",
      description,
      amount: settleAmount,
      paidBy,
      splits,
      recordedAt: parsedRecordedAt || new Date(),
    });

    const populatedExpense = await populateExpense(Expense.findById(expense._id));
    res.status(201).json(populatedExpense);
  } catch (err) {
    console.error("SETTLE GROUP ERROR:", err);
    res.status(500).json({ message: "Failed to record group settlement" });
  }
};

/* ================= ADD EXPENSE ================= */
exports.addExpense = async (req, res) => {
  try {
    const { groupId, description, amount, paidBy, splits, recordedAt } = req.body;

    if (!groupId || !description || amount === undefined || !splits?.length) {
      return res.status(400).json({ message: "Invalid expense data" });
    }

    const group = await assertGroupMember(groupId, req.user._id);
    if (!group) {
      return res.status(403).json({ message: "Not authorized for this group" });
    }

    const totalAmount = Number(amount);
    if (Number.isNaN(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    const payerId = paidBy || req.user._id;
    const isPayerMember = group.members.some((m) => m.toString() === payerId.toString());
    if (!isPayerMember) {
      return res.status(400).json({ message: "Payer must be a group member" });
    }

    const splitError = validateSplits(splits, totalAmount, group);
    if (splitError) {
      return res.status(400).json({ message: splitError });
    }

    const parsedRecordedAt = parseRecordedAt(recordedAt);
    if (recordedAt && !parsedRecordedAt) {
      return res.status(400).json({ message: "Invalid recordedAt date" });
    }

    const expense = await Expense.create({
      groupId,
      description: String(description).trim(),
      amount: totalAmount,
      paidBy: payerId,
      splits: splits.map((s) => ({
        user: s.user,
        amount: Number(s.amount),
      })),
      recordedAt: parsedRecordedAt || new Date(),
    });

    const populatedExpense = await populateExpense(Expense.findById(expense._id));
    res.status(201).json(populatedExpense);
  } catch (err) {
    console.error("ADD EXPENSE ERROR:", err);
    res.status(500).json({ message: "Failed to add expense" });
  }
};

/* ================= UPDATE EXPENSE ================= */
exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (expense.type === "settlement") {
      return res.status(400).json({ message: "Settlement records cannot be edited" });
    }

    const group = await assertGroupMember(expense.groupId, req.user._id);
    if (!group) {
      return res.status(403).json({ message: "Not authorized to edit this expense" });
    }

    const { description, amount, paidBy, splits, recordedAt } = req.body;
    const nextAmount = amount !== undefined ? Number(amount) : expense.amount;

    if (description !== undefined) {
      if (!String(description).trim()) {
        return res.status(400).json({ message: "Description is required" });
      }
      expense.description = String(description).trim();
    }

    if (amount !== undefined) {
      if (Number.isNaN(nextAmount) || nextAmount <= 0) {
        return res.status(400).json({ message: "Amount must be greater than 0" });
      }
      expense.amount = nextAmount;
    }

    if (paidBy !== undefined) {
      const isMember = group.members.some((m) => m.toString() === paidBy.toString());
      if (!isMember) {
        return res.status(400).json({ message: "Payer must be a group member" });
      }
      expense.paidBy = paidBy;
    }

    const splitsToValidate = splits !== undefined ? splits : expense.splits;
    const splitError = validateSplits(
      splitsToValidate.map((s) => ({
        user: s.user?._id || s.user,
        amount: s.amount,
      })),
      nextAmount,
      group
    );
    if (splitError) {
      return res.status(400).json({ message: splitError });
    }

    if (splits !== undefined) {
      expense.splits = splits.map((s) => ({
        user: s.user,
        amount: Number(s.amount),
      }));
    }

    if (recordedAt !== undefined) {
      const parsedRecordedAt = parseRecordedAt(recordedAt);
      if (!parsedRecordedAt) {
        return res.status(400).json({ message: "Invalid recordedAt date" });
      }
      expense.recordedAt = parsedRecordedAt;
    }

    await expense.save();

    const populatedExpense = await populateExpense(Expense.findById(expense._id));
    res.json(populatedExpense);
  } catch (err) {
    console.error("UPDATE EXPENSE ERROR:", err);
    res.status(500).json({ message: "Failed to update expense" });
  }
};

/* ================= GET EXPENSES ================= */
exports.getExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid group ID" });
    }

    const group = await assertGroupMember(groupId, req.user._id);
    if (!group) {
      return res.status(403).json({ message: "Not authorized for this group" });
    }

    const expenses = await populateExpense(
      Expense.find({ groupId }).sort({ recordedAt: -1, createdAt: -1 })
    );

    res.json(expenses);
  } catch (err) {
    console.error("GET EXPENSES ERROR:", err);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
};
