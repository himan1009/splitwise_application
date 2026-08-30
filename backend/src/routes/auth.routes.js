const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const auth = require("../middleware/auth");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/verify-email", authController.verifyEmail);
router.get("/confirm-email-change", authController.confirmEmailChange);
router.post("/resend-verification", authController.resendVerification);
router.post("/resend-verification/me", auth, authController.resendVerification);
router.post("/verify-current-email", auth, authController.verifyCurrentEmail);
router.post("/change-email", auth, authController.requestEmailChange);
router.post("/cancel-email-change", auth, authController.cancelEmailChange);
router.get("/me", auth, authController.getProfile);

/* delete account */
router.delete("/delete-account", auth, async (req, res) => {
  try {
    const PersonalEntry = require("../models/PersonalEntry");
    const Debt = require("../models/Debt");
    const Group = require("../models/Group");
    const Expense = require("../models/Expense");
    const userId = req.user._id;

    await PersonalEntry.deleteMany({ userId });
    await Debt.deleteMany({
      $or: [{ from: userId }, { to: userId }],
    });

    const ownedGroups = await Group.find({ createdBy: userId });
    for (const group of ownedGroups) {
      const remaining = group.members.filter(
        (memberId) => memberId.toString() !== userId.toString()
      );

      if (remaining.length === 0) {
        await Expense.deleteMany({ groupId: group._id });
        await Group.deleteOne({ _id: group._id });
      } else {
        await Group.updateOne(
          { _id: group._id },
          { createdBy: remaining[0], $pull: { members: userId } }
        );
      }
    }

    await Group.updateMany(
      { members: userId, createdBy: { $ne: userId } },
      { $pull: { members: userId } }
    );

    await req.user.deleteOne();

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Delete account error:", err);
    res.status(500).json({ message: "Failed to delete account" });
  }
});

module.exports = router;
