// external import
import mongoose, { isValidObjectId } from "mongoose";

// internal import
import { Playlist } from "../models/playlist.model.js";
import { asyncHandlerWP } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createPlaylist = asyncHandlerWP(async (req, res) => {
    //TODO: create playlist
    const { name, description } = req.body;

    if (!name) {
        throw new ApiError(400, "please provide playlist name");
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id,
    });

    return res
        .status(201)
        .json(new ApiResponse(200, playlist, "Playlist Created Successfully"));
});

const addVideoToPlaylist = asyncHandlerWP(async (req, res) => {
    //TODO add a video to play list
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Playlist or video Id!");
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $push: { videos: videoId } },
        { new: true }
    );

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video added to playlist"));
});

const removeVideoFromPlaylist = asyncHandlerWP(async (req, res) => {
    // TODO: remove video from playlist
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Playlist or video Id!");
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $pull: { videos: videoId } },
        { new: true }
    );

    if (!playlist) {
        throw new ApiError(400, "playlist not found!");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "Video has been Removed from the playlist"
            )
        );
});

const getUserPlaylists = asyncHandlerWP(async (req, res) => {
    //TODO: get user playlists
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID!");
    }

    const userPlaylists = await Playlist.find({ owner: userId });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                userPlaylists,
                "User Playlists Fetched Successfully"
            )
        );
});

const getPlaylistById = asyncHandlerWP(async (req, res) => {
    //TODO: get playlist by id
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist Id");
    }

    const playlist = await Playlist.findById(playlistId);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "Playlist Details Fetched Successfully"
            )
        );
});

const updatePlaylist = asyncHandlerWP(async (req, res) => {
    //TODO: update playlist
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist Id!");
    }

    const updatePlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            name,
            description,
        },
        { new: true }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatePlaylist, "Playlist Update Successful")
        );
});

const deletePlaylist = asyncHandlerWP(async (req, res) => {
    // TODO: delete playlist
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist Id!");
    }

    await Playlist.findByIdAndDelete({ _id: playlistId });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Playlist Deleted Successful"));
});


export {
    createPlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    getUserPlaylists,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
};
