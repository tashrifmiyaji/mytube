import { Router } from "express";
import {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/addComment/:videoId").post(addComment);
router.route("/updateComment/:commentId").patch(updateComment);
router.route("/deleteComment/:commentId").delete(deleteComment);

export default router;
