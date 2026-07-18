const PersonalEntry = require("../models/PersonalEntry");

const EXPENSE_CATEGORIES = [
  "food",
  "transport",
  "rent",
  "utilities",
  "shopping",
  "partying",
  "investment",
  "health",
  "entertainment",
  "education",
  "other",
];

const INCOME_CATEGORIES = [
  "salary",
  "freelance",
  "investment_return",
  "gift",
  "other",
];

const parseMonth = (monthStr) => {
  const [year, month] = monthStr.split("-").map(Number);
  if (!year || !month || month < 1 || month > 12) {
    return null;
  }
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
};

const parseDate = (dateStr) => {
  if (typeof dateStr === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split("-").map(Number);
    const start = new Date(year, month - 1, day, 0, 0, 0, 0);
    const end = new Date(year, month - 1, day, 23, 59, 59, 999);
    return { start, end };
  }

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start: date, end };
};

const toLocalDateKey = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const parseEntryDate = (dateStr) => {
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return null;

  // Date-only strings (legacy) default to noon; ISO datetimes keep their time.
  if (typeof dateStr === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    parsed.setHours(12, 0, 0, 0);
  }

  return parsed;
};

const getCategories = (req, res) => {
  res.json({
    expense: EXPENSE_CATEGORIES,
    income: INCOME_CATEGORIES,
  });
};

const createEntry = async (req, res) => {
  try {
    const { type, amount, date, category, message } = req.body;

    if (!type || !["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "Invalid entry type" });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const parsedDate = parseEntryDate(date);
    if (!parsedDate) {
      return res.status(400).json({ message: "Invalid date" });
    }

    const allowed =
      type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    if (!category || !allowed.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const entry = await PersonalEntry.create({
      userId: req.user._id,
      type,
      amount: Number(amount),
      date: parsedDate,
      category,
      message: message || "",
    });

    res.status(201).json(entry);
  } catch (err) {
    console.error("Create personal entry error:", err);
    res.status(500).json({ message: "Failed to create entry" });
  }
};

const getEntries = async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({ message: "month query param required (YYYY-MM)" });
    }

    const range = parseMonth(month);
    if (!range) {
      return res.status(400).json({ message: "Invalid month format" });
    }

    const entries = await PersonalEntry.find({
      userId: req.user._id,
      date: { $gte: range.start, $lte: range.end },
    }).sort({ date: -1, createdAt: -1 });

    res.json(entries);
  } catch (err) {
    console.error("Get personal entries error:", err);
    res.status(500).json({ message: "Failed to fetch entries" });
  }
};

const updateEntry = async (req, res) => {
  try {
    const entry = await PersonalEntry.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    const { type, amount, date, category, message } = req.body;

    if (type !== undefined) {
      if (!["income", "expense"].includes(type)) {
        return res.status(400).json({ message: "Invalid entry type" });
      }
      entry.type = type;
      const allowed =
        entry.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
      if (!allowed.includes(entry.category)) {
        entry.category = "other";
      }
    }

    if (amount !== undefined) {
      if (Number(amount) <= 0) {
        return res.status(400).json({ message: "Amount must be greater than 0" });
      }
      entry.amount = Number(amount);
    }

    if (date !== undefined) {
      const parsedDate = parseEntryDate(date);
      if (!parsedDate) {
        return res.status(400).json({ message: "Invalid date" });
      }
      entry.date = parsedDate;
    }

    if (category !== undefined) {
      const allowed =
        entry.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
      if (!allowed.includes(category)) {
        return res.status(400).json({ message: "Invalid category" });
      }
      entry.category = category;
    }

    if (message !== undefined) {
      entry.message = message;
    }

    await entry.save();
    res.json(entry);
  } catch (err) {
    console.error("Update personal entry error:", err);
    res.status(500).json({ message: "Failed to update entry" });
  }
};

const deleteEntry = async (req, res) => {
  try {
    const entry = await PersonalEntry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    res.json({ message: "Entry deleted" });
  } catch (err) {
    console.error("Delete personal entry error:", err);
    res.status(500).json({ message: "Failed to delete entry" });
  }
};

const getMonthlySummary = async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({ message: "month query param required (YYYY-MM)" });
    }

    const range = parseMonth(month);
    if (!range) {
      return res.status(400).json({ message: "Invalid month format" });
    }

    const match = {
      userId: req.user._id,
      date: { $gte: range.start, $lte: range.end },
    };

    const [totals, byCategory] = await Promise.all([
      PersonalEntry.aggregate([
        { $match: match },
        {
          $group: {
            _id: "$type",
            total: { $sum: "$amount" },
          },
        },
      ]),
      PersonalEntry.aggregate([
        { $match: { ...match, type: "expense" } },
        {
          $group: {
            _id: "$category",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]),
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;
    totals.forEach((t) => {
      if (t._id === "income") totalIncome = t.total;
      if (t._id === "expense") totalExpenses = t.total;
    });

    res.json({
      month,
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      byCategory,
    });
  } catch (err) {
    console.error("Monthly summary error:", err);
    res.status(500).json({ message: "Failed to fetch monthly summary" });
  }
};

const getDailySummary = async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({ message: "month query param required (YYYY-MM)" });
    }

    const range = parseMonth(month);
    if (!range) {
      return res.status(400).json({ message: "Invalid month format" });
    }

    const entries = await PersonalEntry.find({
      userId: req.user._id,
      date: { $gte: range.start, $lte: range.end },
    }).select("type amount date");

    const dayMap = {};

    entries.forEach((entry) => {
      const dateKey = toLocalDateKey(entry.date);
      if (!dateKey) return;

      if (!dayMap[dateKey]) {
        dayMap[dateKey] = {
          _id: dateKey,
          income: 0,
          expenses: 0,
          entryCount: 0,
          net: 0,
        };
      }

      dayMap[dateKey].entryCount += 1;
      if (entry.type === "income") {
        dayMap[dateKey].income += entry.amount;
      } else {
        dayMap[dateKey].expenses += entry.amount;
      }
      dayMap[dateKey].net = dayMap[dateKey].income - dayMap[dateKey].expenses;
    });

    const days = Object.values(dayMap).sort((a, b) => a._id.localeCompare(b._id));

    res.json(days);
  } catch (err) {
    console.error("Daily summary error:", err);
    res.status(500).json({ message: "Failed to fetch daily summary" });
  }
};

const getDayDetail = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: "date query param required (YYYY-MM-DD)" });
    }

    const range = parseDate(date);
    if (!range) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const entries = await PersonalEntry.find({
      userId: req.user._id,
      date: { $gte: range.start, $lte: range.end },
    }).sort({ createdAt: -1 });

    let totalIncome = 0;
    let totalExpenses = 0;
    const byCategory = {};

    entries.forEach((e) => {
      if (e.type === "income") {
        totalIncome += e.amount;
      } else {
        totalExpenses += e.amount;
        if (!byCategory[e.category]) {
          byCategory[e.category] = { total: 0, count: 0, entries: [] };
        }
        byCategory[e.category].total += e.amount;
        byCategory[e.category].count += 1;
        byCategory[e.category].entries.push(e);
      }
    });

    res.json({
      date,
      totalIncome,
      totalExpenses,
      net: totalIncome - totalExpenses,
      entries,
      byCategory,
    });
  } catch (err) {
    console.error("Day detail error:", err);
    res.status(500).json({ message: "Failed to fetch day detail" });
  }
};

module.exports = {
  getCategories,
  createEntry,
  getEntries,
  updateEntry,
  deleteEntry,
  getMonthlySummary,
  getDailySummary,
  getDayDetail,
};
