const mongoose = require("mongoose");

module.exports = mongoose.model("Booking", new mongoose.Schema({
  home: { type: mongoose.Schema.Types.ObjectId, ref: "Home", required: true },
  guest: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { type: Number, required: true, min: 1, max: 16 },
  guestNames: { type: [String], required: true },
  totalPrice: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed" },
}, { timestamps: true }));
