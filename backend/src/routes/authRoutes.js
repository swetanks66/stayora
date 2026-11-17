const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

router.post("/register", async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, userType = "guest" } = req.body;
    if (!firstName || !email || !password || !["guest", "host"].includes(userType)) {
      return res.status(422).json({ message: "Name, email, password, and valid role are required" });
    }
    if (password.length < 8) return res.status(422).json({ message: "Password must be at least 8 characters" });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "An account already exists for this email" });
    const user = await User.create({ firstName, lastName, email, userType, password: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: sign(user), user: safeUser(user) });
  } catch (error) { next(error); }
});

router.post("/login", async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await bcrypt.compare(req.body.password || "", user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.json({ token: sign(user), user: safeUser(user) });
  } catch (error) { next(error); }
});

function sign(user) {
  return jwt.sign({ id: user._id.toString(), userType: user.userType, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
}
function safeUser(user) {
  return { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, userType: user.userType };
}
module.exports = router;
