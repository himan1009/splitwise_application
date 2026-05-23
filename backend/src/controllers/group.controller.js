// const Group = require("../models/Group");
// const User = require("../models/User");

// exports.getAllUsers = async (req, res) => {
//   const users = await User.find({}, "name email");
//   res.json(users);
// };

// exports.createGroup = async (req, res) => {
//   const { name, memberIds } = req.body;

//   // ensure creator is included
//   if (!memberIds.includes(req.user.id)) {
//     memberIds.push(req.user.id);
//   }

//   const group = await Group.create({
//     name,
//     createdBy: req.user.id,
//     members: memberIds
//   });

//   res.json(group);
// };

// exports.getGroups = async (req, res) => {
//   const groups = await Group.find({
//     members: req.user.id
//   }).populate("members", "name email");

//   res.json(groups);
// };



const Group = require("../models/Group");
const Expense = require("../models/Expense");

/* CREATE GROUP */
exports.createGroup = async (req, res) => {
  const { name } = req.body;

  const group = await Group.create({
    name,
    createdBy: req.user.id,
    members: [req.user.id]
  });

  res.json(group);
};

/* GET GROUPS (ONLY WHERE USER IS MEMBER) */
exports.getGroups = async (req, res) => {
  const groups = await Group.find({
    members: req.user.id
  }).populate("members", "name email");

  res.json(groups);
};

/* ADD MEMBER (ONLY CREATOR CAN ADD – OPTIONAL BUT RECOMMENDED) */
exports.addMember = async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  const group = await Group.findById(groupId);

  if (!group)
    return res.status(404).json({ message: "Group not found" });

  // optional rule (recommended)
  if (String(group.createdBy) !== req.user.id) {
    return res
      .status(403)
      .json({ message: "Only group creator can add members" });
  }

  await Group.findByIdAndUpdate(groupId, {
    $addToSet: { members: userId }
  });

  res.json({ message: "Member added" });
};

/* REMOVE MEMBER */
exports.removeMember = async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  const group = await Group.findById(groupId);

  if (!group)
    return res.status(404).json({ message: "Group not found" });

  // creator cannot be removed
  if (String(group.createdBy) === userId) {
    return res
      .status(400)
      .json({ message: "Cannot remove group creator" });
  }

  await Group.findByIdAndUpdate(groupId, {
    $pull: { members: userId }
  });

  res.json({ message: "Member removed" });
};

/* DELETE GROUP (ONLY CREATOR) */
exports.deleteGroup = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user._id.toString();

  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json({ message: "Group not found" });
  }

  // ✅ ONLY CREATOR CAN DELETE
  if (group.createdBy.toString() !== userId) {
    return res.status(403).json({ message: "Only admin can delete group" });
  }

  await Expense.deleteMany({ groupId });
  await group.deleteOne();

  res.json({ message: "Group deleted successfully" });
};
