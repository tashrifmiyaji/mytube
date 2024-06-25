// external inputs
import { Router } from "express";

// internal inputs
import {
    toggleSubscription,
    getUserChannelSubscribers,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

// initialization
const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/toggleSubscription/:channelId").post(toggleSubscription);
router.route("/channelSubscribers/:channelId").get(getUserChannelSubscribers)

export default router;
