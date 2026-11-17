const router = require("express").Router();
const Booking = require("../models/Booking");
const Home = require("../models/Home");
const { auth, role } = require("../middleware/auth");

router.use(auth, role("guest"));
router.get("/", async (req, res, next) => {
  try { res.json(await Booking.find({ guest: req.user.id, status: "confirmed" }).populate("home").sort({ checkIn: 1 })); } catch (error) { next(error); }
});
router.post("/", async (req, res, next) => {
  try {
    const { homeId, checkIn, checkOut, guests, guestNames } = req.body;
    const home = await Home.findById(homeId);
    const start = new Date(`${checkIn}T00:00:00.000Z`);
    const end = new Date(`${checkOut}T00:00:00.000Z`);
    const count = Number(guests);
    const names = Array.isArray(guestNames) ? guestNames.map((name) => String(name).trim()) : [];
    const nights = Math.ceil((end - start) / 86400000);
    if (!home || !checkIn || !checkOut || nights < 1 || !Number.isInteger(count) || count < 1 || count > 16 || names.length !== count || names.some((name) => !name)) {
      return res.status(422).json({ message: "Provide valid dates and one full name for every guest" });
    }
    const conflict = await Booking.exists({ home: home._id, status: "confirmed", checkIn: { $lt: end }, checkOut: { $gt: start } });
    if (conflict) return res.status(409).json({ message: "Those dates are already booked" });
    const booking = await Booking.create({ home: home._id, guest: req.user.id, checkIn: start, checkOut: end, guests: count, guestNames: names, totalPrice: nights * home.price });
    res.status(201).json(await booking.populate("home"));
  } catch (error) { next(error); }
});
router.delete("/:id", async (req, res, next) => {
  try { await Booking.findOneAndUpdate({ _id: req.params.id, guest: req.user.id, status: "confirmed" }, { status: "cancelled" }); res.json({ cancelled: true }); } catch (error) { next(error); }
});
module.exports = router;
