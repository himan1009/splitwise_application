// const User = require("../models/User");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// exports.register = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     const existing = await User.findOne({ email });
//     if (existing) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     const hashed = await bcrypt.hash(password, 10);

//     await User.create({
//       name,
//       email,
//       password: hashed
//     });

//     res.status(201).json({ message: "Registered successfully" });
//   } catch (err) {
//     res.status(500).json({ message: "Register failed" });
//   }
// };

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     const match = await bcrypt.compare(password, user.password);
//     if (!match) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     const token = jwt.sign(
//       { id: user._id },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.json({
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email
//       }
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Login failed" });
//   }
// };



// const User = require("../models/User");
// const Group = require("../models/Group");
// const Expense = require("../models/Expense");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// /* REGISTER */
// exports.register = async (req, res) => {
//   const { name, email, password } = req.body;

//   const exists = await User.findOne({ email });
//   if (exists) return res.status(400).json({ message: "User exists" });

//   const hashed = await bcrypt.hash(password, 10);
//   await User.create({ name, email, password: hashed });

//   res.json({ message: "Registered successfully" });
// };

// /* LOGIN */
// exports.login = async (req, res) => {
//   const { email, password } = req.body;
//   const user = await User.findOne({ email });
//   if (!user) return res.status(400).json({ message: "Invalid credentials" });

//   const match = await bcrypt.compare(password, user.password);
//   if (!match) return res.status(400).json({ message: "Invalid credentials" });

//   const token = jwt.sign(
//     { id: user._id, email: user.email },
//     process.env.JWT_SECRET
//   );

//   res.json({
//     token,
//     user: { id: user._id, name: user.name, email: user.email }
//   });
// };

// /* GET ALL USERS */
// exports.getUsers = async (req, res) => {
//   const users = await User.find().select("name email");
//   res.json(users);
// };

// /* DELETE ACCOUNT */
// exports.deleteAccount = async (req, res) => {
//   const userId = req.user.id;

//   await Expense.deleteMany({
//     $or: [{ paidBy: userId }, { "splits.user": userId }]
//   });

//   await Group.updateMany({}, { $pull: { members: userId } });
//   await User.findByIdAndDelete(userId);

//   res.json({ message: "Account deleted" });
// };



const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ================= REGISTER ================= */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }

    if (String(password).length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Unable to register with these details" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    let token;
    try {
      token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    } catch (jwtErr) {
      console.error("JWT ERROR:", jwtErr);
      return res.status(500).json({ message: "Token generation failed" });
    }

    // 🚨 THIS RETURN IS CRITICAL
    return res.status(200).json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Login failed" });
  }
};
