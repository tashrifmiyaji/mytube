// external inputs
import { Router } from "express";

// internal inputs
import {
    toggleSubscription,
    getChannelSubscribers,
    getSubscribedChannels
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

// initialization
const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/toggleSubscription/:channelId").post(toggleSubscription);
router.route("/channelSubscribers").get(getChannelSubscribers)
router.route("/subscribedChannels").get(getSubscribedChannels)

export default router;
