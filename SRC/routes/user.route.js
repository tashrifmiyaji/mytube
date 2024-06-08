// external inputs
import { Router } from "express";

// internal input
import { registerUser } from "../controllers/user.controller.js";

// initilaization
const router = Router();

router.route("/register").post(registerUser);

export default router;
