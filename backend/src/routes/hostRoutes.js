const router = require("express").Router();
const Home = require("../models/Home");
const Booking = require("../models/Booking");
const { auth, role } = require("../middleware/auth");
const upload = require("multer")({ dest: "uploads/" });

router.use(auth, role("host"));
router.get("/homes", async (req, res, next) => {
  try { res.json(await Home.find({ host: req.user.id }).sort({ createdAt: -1 })); } catch (error) { next(error); }
});
router.post("/homes", upload.single("photo"), async (req, res, next) => {
  try {
    const home = await Home.create({ ...req.body, host: req.user.id, photo: req.file ? `/uploads/${req.file.filename}` : "" });
    res.status(201).json(home);
  } catch (error) { next(error); }
});
router.patch("/homes/:id", async (req, res, next) => {
  try { const home = await Home.findOneAndUpdate({ _id: req.params.id, host: req.user.id }, req.body, { new: true, runValidators: true }); if (!home) return res.status(404).json({ message: "Stay not found" }); res.json(home); } catch (error) { next(error); }
});
router.delete("/homes/:id", async (req, res, next) => {
  try { await Home.findOneAndDelete({ _id: req.params.id, host: req.user.id }); res.json({ deleted: true }); } catch (error) { next(error); }
});
router.get("/bookings", async (req, res, next) => {
  try { const homes = await Home.find({ host: req.user.id }).select("_id"); res.json(await Booking.find({ home: { $in: homes.map((home) => home._id) }, status: "confirmed" }).populate("home").populate("guest", "firstName lastName email").sort({ checkIn: 1 })); } catch (error) { next(error); }
});
module.exports = router;
