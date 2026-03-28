import express from "express";
import {
  createBooking,
  getMyBookings,
  getShowtimeAndSeats,
  getAllBookings,
} from "../controllers/booking.controller";
import { protectRoute, isAdmin } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/", protectRoute, createBooking);
router.get("/my-bookings", protectRoute, getMyBookings);
router.get("/showtime", getShowtimeAndSeats);
router.get("/all", protectRoute, isAdmin, getAllBookings);

export default router;
