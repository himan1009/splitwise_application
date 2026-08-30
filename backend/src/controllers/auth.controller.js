const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateToken, hashToken } = require("../utils/tokens");
const {
  sendVerificationEmail,
  sendEmailChangeConfirmation,
} = require("../services/email.service");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function isLegacyVerified(user) {
  return user.emailVerified !== false;
}

function formatUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified === true,
    needsEmailAttention: user.emailVerified !== true,
    pendingEmail: user.pendingEmail || null,
  };
}

async function issueVerification(user, { markUnverified = false } = {}) {
  const token = generateToken();
  user.verificationTokenHash = hashToken(token);
  user.verificationTokenExpires = new Date(Date.now() + VERIFICATION_TTL_MS);
  // Only new signups get locked out until verified. Legacy users keep login access.
  if (markUnverified) {
    user.emailVerified = false;
  }
  await user.save();
  await sendVerificationEmail(user.email, token);
}

/* ================= REGISTER ================= */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedEmail = normalizeEmail(email);

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

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      emailVerified: false,
    });

    try {
      await issueVerification(user, { markUnverified: true });
    } catch (emailErr) {
      console.error("Verification email failed:", emailErr);
      return res.status(201).json({
        message:
          "Account created but verification email could not be sent. Try resend verification on the login page.",
        emailSent: false,
        email: normalizedEmail,
      });
    }

    res.status(201).json({
      message: "Account created! Check your email to verify before signing in.",
      emailSent: true,
      email: normalizedEmail,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
};

/* ================= LOGIN ================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.emailVerified === false) {
      return res.status(403).json({
        message: "Please verify your email before signing in. Check your inbox or resend the link.",
        code: "EMAIL_NOT_VERIFIED",
        email: user.email,
      });
    }

    let token;
    try {
      token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    } catch (jwtErr) {
      console.error("JWT ERROR:", jwtErr);
      return res.status(500).json({ message: "Token generation failed" });
    }

    return res.status(200).json({
      token,
      user: formatUser(user),
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Login failed" });
  }
};

/* ================= VERIFY EMAIL (signup) ================= */
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }

    const tokenHash = hashToken(token);
    const user = await User.findOne({
      verificationTokenHash: tokenHash,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification link" });
    }

    user.emailVerified = true;
    user.verificationTokenHash = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({ message: "Email verified successfully! You can now sign in.", email: user.email });
  } catch (err) {
    console.error("Verify email error:", err);
    res.status(500).json({ message: "Verification failed" });
  }
};

/* ================= RESEND VERIFICATION ================= */
exports.resendVerification = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email || req.user?.email || "");
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "If that account exists, a verification email has been sent." });
    }

    if (user.emailVerified === true) {
      return res.status(400).json({ message: "This email is already verified" });
    }

    await issueVerification(user);
    res.json({ message: "Verification email sent. Check your inbox." });
  } catch (err) {
    console.error("Resend verification error:", err);
    res.status(500).json({ message: "Could not send verification email" });
  }
};

/* ================= CHANGE EMAIL (logged in) ================= */
exports.requestEmailChange = async (req, res) => {
  try {
    const { newEmail } = req.body;
    if (!newEmail) {
      return res.status(400).json({ message: "New email is required" });
    }

    const normalizedNew = normalizeEmail(newEmail);
    if (!EMAIL_REGEX.test(normalizedNew)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }

    if (normalizedNew === req.user.email) {
      return res.status(400).json({ message: "This is already your current email" });
    }

    const taken = await User.findOne({ email: normalizedNew });
    if (taken) {
      return res.status(400).json({ message: "That email is already in use" });
    }

    const token = generateToken();
    req.user.pendingEmail = normalizedNew;
    req.user.emailChangeTokenHash = hashToken(token);
    req.user.emailChangeTokenExpires = new Date(Date.now() + VERIFICATION_TTL_MS);
    await req.user.save();

    await sendEmailChangeConfirmation(normalizedNew, token);

    res.json({
      message: `Confirmation link sent to ${normalizedNew}. Click it to update your email.`,
      pendingEmail: normalizedNew,
    });
  } catch (err) {
    console.error("Request email change error:", err);
    res.status(500).json({ message: "Could not send confirmation email" });
  }
};

/* ================= CONFIRM EMAIL CHANGE ================= */
exports.confirmEmailChange = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: "Confirmation token is required" });
    }

    const tokenHash = hashToken(token);
    const user = await User.findOne({
      emailChangeTokenHash: tokenHash,
      emailChangeTokenExpires: { $gt: new Date() },
      pendingEmail: { $exists: true, $ne: null },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired confirmation link" });
    }

    const taken = await User.findOne({ email: user.pendingEmail, _id: { $ne: user._id } });
    if (taken) {
      return res.status(400).json({ message: "That email is no longer available" });
    }

    user.email = user.pendingEmail;
    user.pendingEmail = undefined;
    user.emailChangeTokenHash = undefined;
    user.emailChangeTokenExpires = undefined;
    user.emailVerified = true;
    user.verificationTokenHash = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({
      message: "Email updated and verified successfully!",
      email: user.email,
    });
  } catch (err) {
    console.error("Confirm email change error:", err);
    res.status(500).json({ message: "Could not confirm email change" });
  }
};

/* ================= VERIFY CURRENT EMAIL (logged in, legacy/dummy users) ================= */
exports.verifyCurrentEmail = async (req, res) => {
  try {
    if (req.user.emailVerified === true) {
      return res.status(400).json({ message: "Your email is already verified" });
    }

    await issueVerification(req.user);
    res.json({ message: `Verification link sent to ${req.user.email}` });
  } catch (err) {
    console.error("Verify current email error:", err);
    res.status(500).json({ message: "Could not send verification email" });
  }
};

/* ================= GET PROFILE ================= */
exports.getProfile = async (req, res) => {
  res.json({ user: formatUser(req.user) });
};

/* ================= CANCEL PENDING EMAIL CHANGE ================= */
exports.cancelEmailChange = async (req, res) => {
  try {
    req.user.pendingEmail = undefined;
    req.user.emailChangeTokenHash = undefined;
    req.user.emailChangeTokenExpires = undefined;
    await req.user.save();
    res.json({ message: "Pending email change cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Could not cancel email change" });
  }
};
