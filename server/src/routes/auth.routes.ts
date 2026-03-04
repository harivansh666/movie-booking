import express from "express";
import { signup, signin, signout, getMe } from "../controllers/auth.controller";
import { protectRoute } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/signout", signout);

router.get("/me", protectRoute, getMe);

export default router;
