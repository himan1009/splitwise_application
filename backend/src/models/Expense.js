// const mongoose = require("mongoose");

// const expenseSchema = new mongoose.Schema(
//   {
//     groupId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Group",
//       required: true
//     },
//     description: {
//       type: String,
//       required: true
//     },
//     amount: {
//       type: Number,
//       required: true
//     },
//     paidBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true
//     },
//     splits: [
//       {
//         user: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "User",
//           required: true
//         },
//         amount: {
//           type: Number,
//           required: true
//         }
//       }
//     ]
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Expense", expenseSchema);


const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true
    },
    description: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    splits: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        amount: {
          type: Number,
          required: true
        }
      }
    ],
    recordedAt: {
      type: Date,
      default: Date.now,
    },
    type: {
      type: String,
      enum: ["expense", "settlement"],
      default: "expense",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);


