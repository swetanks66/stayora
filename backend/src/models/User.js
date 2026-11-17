const mongoose = require("mongoose");

module.exports = mongoose.model("User", new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ["guest", "host"], default: "guest" },
  favourites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Home" }],
}));
