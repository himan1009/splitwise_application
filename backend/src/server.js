// require("dotenv").config();
// const app = require("./app");
// const connectDB = require("./config/db");

// connectDB();
// app.listen(process.env.PORT, () =>
//   console.log("Server running on port", process.env.PORT)
// );



// require("dotenv").config();
// const app = require("./app");
// const connectDB = require("./config/db");

// connectDB();

// app.listen(5000, () =>
//   console.log("Server running on port 5000")
// );



// const mongoose = require("mongoose");
// const app = require("./app");

// const PORT = 5000;

// mongoose
//   .connect("mongodb://127.0.0.1:27017/splitwise", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
//   })
//   .then(() => {
//     console.log("MongoDB connected");
//     app.listen(PORT, () =>
//       console.log(`Server running on port ${PORT}`)
//     );
//   })
//   .catch((err) => console.error("Mongo error:", err));


require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected to:", process.env.MONGO_URI);
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("Mongo connection error:", err);
    process.exit(1);
  });
