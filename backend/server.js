require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./src/routes/authRoutes");
const homeRoutes = require("./src/routes/homeRoutes");
const bookingRoutes = require("./src/routes/bookingRoutes");
const hostRoutes = require("./src/routes/hostRoutes");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("/api/health", (req, res) => res.json({ ok: true, service: "stayora-api" }));
app.use("/api/auth", authRoutes);
app.use("/api/homes", homeRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/host", hostRoutes);
app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({ message: error.message || "Server error" });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => app.listen(port, () => console.log(`Stayora API: http://localhost:${port}`)))
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exitCode = 1;
  });
