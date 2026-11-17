const router = require("express").Router();
const Home = require("../models/Home");
const User = require("../models/User");
const { auth } = require("../middleware/auth");

router.get("/", async (req, res, next) => {
  try {
    const query = String(req.query.q || "").trim();
    const filter = query ? { $or: [
      { houseName: { $regex: query, $options: "i" } },
      { location: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ] } : {};
    res.json(await Home.find(filter).sort({ createdAt: -1 }));
  } catch (error) { next(error); }
});
router.get("/me/favourites", auth, async (req, res, next) => {
  try { res.json((await User.findById(req.user.id).populate("favourites")).favourites); } catch (error) { next(error); }
});
router.post("/:id/favourite", auth, async (req, res, next) => {
  try {
    if (req.user.userType !== "guest") return res.status(403).json({ message: "Only guests can save stays" });
    const user = await User.findById(req.user.id);
    if (!user.favourites.some((id) => id.toString() === req.params.id)) user.favourites.push(req.params.id);
    await user.save();
    res.json({ saved: true });
  } catch (error) { next(error); }
});
router.get("/:id", async (req, res, next) => {
  try {
    const home = await Home.findById(req.params.id).populate("host", "firstName lastName");
    if (!home) return res.status(404).json({ message: "Stay not found" });
    res.json(home);
  } catch (error) { next(error); }
});
router.delete("/:id/favourite", auth, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $pull: { favourites: req.params.id } });
    res.json({ saved: false });
  } catch (error) { next(error); }
});
module.exports = router;
