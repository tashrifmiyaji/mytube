import { Router } from "express";
import {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos,
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

//
const router = Router();
router.use(verifyJWT); // protect all routes

router.route("/toggleVideoLike/:videoId").post(toggleVideoLike);
router.route("/toggleCommentLike/:commentId").post(toggleCommentLike);
router.route("/toggleTweetLike/:tweetId").post(toggleTweetLike);

export default router;
