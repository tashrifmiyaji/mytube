import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getNotifications,
    markNotificationAsRead,
} from "../controllers/notification.controller.js";
import { updateVideo } from "../controllers/video.controller.js";

const router = Router();
router.use(verifyJWT) // protect all routes

router.route("/get-notification").get(getNotifications);
router.route("/mark-notification/:id").get(markNotificationAsRead);

export default router