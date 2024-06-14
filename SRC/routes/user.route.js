// external inputs
import { Router } from "express";

// internal input
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getCurrentUser,
    getUserChannelProfile
} from "../controllers/user.controller.js";
import { avatarUpload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

// initialization
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

// update account details  // secure route
router.route("/update-account-details").patch(verifyJWT, updateAccountDetails);

// update avatar // secure route
router.route("/update-avatar").patch(verifyJWT, updateUserAvatar);

// update cover image // secure route
router.route("/update-cover-image").patch(verifyJWT, updateUserCoverImage);

// get current user  // secure route
router.route("/get-user").get(verifyJWT, getCurrentUser);

// get channel profile  // secure route
router.route("/get-channel-profile").get(verifyJWT, getUserChannelProfile);

// export
export default router;
