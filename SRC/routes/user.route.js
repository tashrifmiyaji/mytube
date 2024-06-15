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
    getUserChannelProfile,
    getWatchHistory
} from "../controllers/user.controller.js";
import {
    avatarAndCoverImageUpload,
    avatarUpdate,
    coverImageUpdate,
} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

// initialization
const router = Router();

// register route
router.route("/register").post(avatarAndCoverImageUpload, registerUser);

// login route
router.route("/login").post(loginUser);

// logout route // secure route
router.route("/logout").post(verifyJWT, logoutUser);

// Refresh Access Token
router.route("/refresh-token").post(refreshAccessToken);

// change current password // secure route
router.route("/change-password").post(verifyJWT, changeCurrentPassword);

// update account details  // secure route
router.route("/update-account").patch(verifyJWT, updateAccountDetails);

// update avatar // secure route
router.route("/update-avatar").patch(verifyJWT, avatarUpdate, updateUserAvatar);

// update cover image // secure route
router
    .route("/update-coverImage")
    .patch(verifyJWT, coverImageUpdate, updateUserCoverImage);

// get current user  // secure route
router.route("/get-user").get(verifyJWT, getCurrentUser);

// get channel profile  // secure route
router.route("/get-profile/:username").get(verifyJWT, getUserChannelProfile);

// get watch history  // secure route
router.route("/watch-history").get(verifyJWT, getWatchHistory)

// export
export default router;
