import express from "express";
import {
  createBooking,
  getMyBookings,
  getShowtimeAndSeats,
} from "../controllers/booking.controller";
import { protectRoute } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/", protectRoute, createBooking);
router.get("/my-bookings", protectRoute, getMyBookings);
router.get("/showtime", getShowtimeAndSeats);

export default router;
