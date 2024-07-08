// external inputs
import { Router } from "express";

// internal inputs
import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteAVideo,
    togglePublishStatus,
} from "../controllers/video.controller.js";
import {
    uploadAVideoAndThumbnail,
    updateThumbnail,
} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

// initialization
const router = Router();

//
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/upload-video").post(uploadAVideoAndThumbnail, publishAVideo);
router.route("/video-byId/:videoId").get(getVideoById);
router.route("/update-video/:videoId").post(updateThumbnail, updateVideo);
router.route("/delete-video/:videoId").delete(deleteAVideo);

// export
export default router;
