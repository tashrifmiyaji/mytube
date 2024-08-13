import { Router } from "express";
import {
    createPlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    getUserPlaylists,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
} from "../controllers/playList.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

//
const router = Router();
router.use(verifyJWT);

//
router.route("/create").post(createPlaylist);
router.route("/add-v/:playlistId/:videoId").patch(addVideoToPlaylist);
router.route("/remove-v/:playlistId/:videoId").patch(removeVideoFromPlaylist);
router.route("/user-playlist/:userId").get(getUserPlaylists);
router.route("/by-id/:playlistId").get(getPlaylistById);
router.route("/update/:playlistId").patch(updatePlaylist);
router.route("/delete/:playlistId").delete(deletePlaylist);


export default router;
