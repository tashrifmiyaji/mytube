// external inputs
import { Router } from "express";

// internal inputs
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controller.js";
import { uploadAVideoAndThumbnail } from "../middlewares/multer.middleware.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"

// initialization
const router = Router();

//
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/upload-video").post(uploadAVideoAndThumbnail, publishAVideo)

// export
export default router

