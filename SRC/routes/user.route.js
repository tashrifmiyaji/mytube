// external inputs
import { Router } from "express";

// internal input
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
} from "../controllers/user.controller.js";
import { avatarUpload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

// initilaization
const router = Router();

// register route
router.route("/register").post(avatarUpload, registerUser);

// login route
router.route("/login").post(loginUser);

// logout route // secure route
router.route("/logout").post(verifyJWT, logoutUser);

// Refresh Access Token
router.route("/refresh-token").post(refreshAccessToken);

// export
export default router;
