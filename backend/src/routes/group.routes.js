// const router = require("express").Router();
// const auth = require("../middleware/auth.middleware");
// const c = require("../controllers/group.controller");

// router.get("/users", auth, c.getAllUsers);
// router.post("/", auth, c.createGroup);
// router.get("/", auth, c.getGroups);

// module.exports = router;


// const router = require("express").Router();
// const auth = require("../middleware/auth");
// const c = require("../controllers/group.controller");

// router.post("/", auth, c.createGroup);
// router.get("/", auth, c.getGroups);
// router.post("/:groupId/add-member", auth, c.addMember);
// router.post("/:groupId/remove-member", auth, c.removeMember);
// router.delete("/:groupId", auth, c.deleteGroup);

// module.exports = router;


// const express = require("express");
// const router = express.Router();
// const auth = require("../middleware/auth");
// const groupController = require("../controllers/group.controller");

// router.get("/", auth, groupController.getGroups);
// router.post("/", auth, groupController.createGroup);
// router.post("/:groupId/add-member", auth, groupController.addMember);
// router.delete("/:groupId", auth, groupController.deleteGroup);

// module.exports = router;


// const express = require("express");
// const router = express.Router();
// const auth = require("../middleware/auth");
// const Group = require("../models/Group");
// const User = require("../models/User");
// const Expense = require("../models/Expense");

// /* ================= GET ALL USERS ================= */
// router.get("/users", auth, async (req, res) => {
//   try {
//     const users = await User.find()
//       .select("_id name email")
//       .sort({ name: 1 });

//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch users" });
//   }
// });

// /* ================= CREATE GROUP ================= */
// router.post("/", auth, async (req, res) => {
//   try {
//     const { name, memberIds = [] } = req.body;

//     if (!name) {
//       return res.status(400).json({ message: "Group name required" });
//     }

//     // Ensure creator is always a member
//     const members = [
//       ...new Set([req.user._id.toString(), ...memberIds])
//     ];

//     const group = await Group.create({
//       name,
//       createdBy: req.user._id,
//       members
//     });

//     res.json(group);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to create group" });
//   }
// });

// /* ================= GET MY GROUPS ================= */
// router.get("/", auth, async (req, res) => {
//   const groups = await Group.find({
//     members: req.user._id
//   })
//     .populate("members", "name email")
//     .populate("createdBy", "_id name email"); // 👈 REQUIRED

//   res.json(groups);
// });


// /* ================= DELETE GROUP (ADMIN ONLY) ================= */
// router.delete("/:groupId", auth, async (req, res) => {
//   try {
//     const { groupId } = req.params;

//     const group = await Group.findById(groupId);
//     if (!group) {
//       return res.status(404).json({ message: "Group not found" });
//     }

//     // ✅ Only creator (admin) can delete
//     if (group.createdBy.toString() !== req.user._id.toString()) {
//       return res
//         .status(403)
//         .json({ message: "Only admin can delete this group" });
//     }

//     // delete all expenses of group
//     await Expense.deleteMany({ groupId });

//     await group.deleteOne();

//     res.json({ message: "Group deleted successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to delete group" });
//   }
// });

// module.exports = router;



const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Group = require("../models/Group");
const User = require("../models/User");
const Expense = require("../models/Expense");

/* ======================================================
   GET ALL USERS (used in CREATE GROUP)
====================================================== */
router.get("/users", auth, async (req, res) => {
  try {
    const users = await User.find()
      .select("_id name email")
      .sort({ name: 1 });

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/* ======================================================
   CREATE GROUP
====================================================== */
router.post("/", auth, async (req, res) => {
  try {
    const { name, memberIds = [] } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Group name required" });
    }

    // creator is always included
    const members = [
      ...new Set([req.user._id.toString(), ...memberIds])
    ];

    const group = await Group.create({
      name,
      createdBy: req.user._id,
      members
    });

    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create group" });
  }
});

/* ======================================================
   GET MY GROUPS
====================================================== */
router.get("/", auth, async (req, res) => {
  try {
    const groups = await Group.find({
      members: req.user._id
    })
      .populate("members", "_id name email")
      .populate("createdBy", "_id name email");

    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch groups" });
  }
});

/* ======================================================
   🔥 GET USERS NOT IN THIS GROUP (THIS FIXES YOUR ISSUE)
====================================================== */
router.get("/:groupId/available-users", auth, async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = group.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: "Not authorized for this group" });
    }

    const users = await User.find({
      _id: { $nin: group.members },
    }).select("_id name email");

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch available users" });
  }
});

/* ======================================================
   ADD MEMBER TO GROUP
====================================================== */
router.post("/:groupId/add-member", auth, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = group.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: "Only group members can add people" });
    }

    const alreadyInGroup = group.members.some(
      (m) => m.toString() === userId.toString()
    );
    if (alreadyInGroup) {
      return res.status(400).json({ message: "User already in group" });
    }

    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
      return res.status(400).json({ message: "User not found" });
    }

    await Group.updateOne(
      { _id: group._id },
      { $addToSet: { members: userId } }
    );

    res.json({ message: "Member added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add member" });
  }
});

/* ======================================================
   DELETE GROUP (ADMIN ONLY)
====================================================== */
router.delete("/:groupId", auth, async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // only creator can delete
    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only admin can delete this group" });
    }

    // delete all expenses of this group
    await Expense.deleteMany({ groupId });

    await group.deleteOne();

    res.json({ message: "Group deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete group" });
  }
});

module.exports = router;
