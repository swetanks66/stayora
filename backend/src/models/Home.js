const mongoose = require("mongoose");

module.exports = mongoose.model("Home", new mongoose.Schema({
  host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  houseName: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  location: { type: String, required: true, trim: true },
  rating: { type: Number, default: 5, min: 0, max: 5 },
  photo: String,
  description: String,
}, { timestamps: true }));
