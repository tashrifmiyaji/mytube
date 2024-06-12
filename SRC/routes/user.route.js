// external inputs
import { Router } from "express";

// internal input
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
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

// change current password // secure route
router.route("/change-password").post(verifyJWT, changeCurrentPassword);

// get current user  // secure route
router.route("/get-user").get(verifyJWT, getCurrentUser);

// export
export default router;
