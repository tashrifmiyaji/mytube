import { Router } from "express";
import {
    createTweet,
    updateTweet,
    getUserTweets,
    deleteTweet,
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // protect all router
router.route("/createTweet").post(createTweet);
router.route("/updateTweet/:tweetId").patch(updateTweet);
router.route("/allTweets").get(getUserTweets);
router.route("/deleteTweet/:tweetId").delete(deleteTweet);

export default router
