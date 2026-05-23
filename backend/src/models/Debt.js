// const mongoose = require("mongoose");

// const debtSchema = new mongoose.Schema(
//   {
//     from: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true
//     },
//     to: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true
//     },
//     amount: {
//       type: Number,
//       required: true
//     },
//     description: {
//       type: String
//     }
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Debt", debtSchema);


const mongoose = require("mongoose");

const debtSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  },
  { timestamps: true } // 🔥 THIS STORES HISTORY
);

module.exports = mongoose.model("Debt", debtSchema);