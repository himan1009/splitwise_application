const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationTokenHash: String,
    verificationTokenExpires: Date,
    pendingEmail: {
      type: String,
      lowercase: true,
    },
    emailChangeTokenHash: String,
    emailChangeTokenExpires: Date,
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
