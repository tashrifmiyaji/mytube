// external inputs
import { Router } from "express";

// internal input
import { registerUser } from "../controllers/user.controller.js";
import { avatarUpload } from "../middlewares/multer.middleware.js";


// initilaization
const router = Router();

router.route("/register").post(
    avatarUpload,
    registerUser
);

export default router;
