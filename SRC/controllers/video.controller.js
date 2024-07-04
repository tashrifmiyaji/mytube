// external inputs
import mongoose, { isValidObjectId } from "mongoose";

// internal inputs
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandlerWP } from "../utils/asyncHandler.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandlerWP(async (req, res) => {
    //TODO: get all videos based on query, sort, pagination
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
});

const publishAVideo = asyncHandlerWP(async (req, res) => {
    // TODO: get video and thumbnail, upload to cloudinary, create video in db
    // get title and description from body
    // check title and description
    // check if the title and description are empty!
    // get video and thumbnail from multer
    // check video and thumbnail
    // upload video and thumbnail on cloudinary
    // check if the video and thumbnail has been uploaded to Cloudinary
    // create video and save in db
    // send responds

    const { title, description } = req.body;

    if (!(title && description)) {
        throw new ApiError(400, "Please provide title and description");
    }

    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "please gibe proper title and description!");
    }

    const videoFile = req.files?.videoFile[0].path;
    const thumbnailFile = req.files?.thumbnail[0].path;


    if (!(videoFile && thumbnailFile)) {
        throw new ApiError(400, "video or thumbnail is missing!");
    }

    console.log(videoFile);

    const video = await uploadOnCloudinary(videoFile, "mytube/videos")
    const thumbnail = await uploadOnCloudinary(thumbnailFile, "mytube/thumbnails")
   

    if (!(video && thumbnail)) {
        throw new ApiError(500, "video and thumbnail uploading problem!");
    }

    const createVideo = await Video.create({
        videoFile: { public_id: video.public_id, url: video.url },
        thumbnail: {public_id: thumbnail.public_id, url: thumbnail.url},
        title,
        description,
        duration: video.duration,
        owner: req.user._id,
    });
    createVideo.save()

    if (!createVideo) {
        throw new ApiError(500, "internal server error!")        
    }

    res
    .status(201)
    .json(new ApiResponse(200, createVideo, "video uploaded successful"))
});

const getVideoById = asyncHandlerWP(async (req, res) => {
    // Todo get video by id
    const { videoId } = req.params;
});

const updateVideo = asyncHandlerWP(async (req, res) => {
    //TODO: update video details like title, description, thumbnail
    const { videoId } = req.params;
});

const deleteVideo = asyncHandlerWP(async (req, res) => {
    //TODO: delete video
    const { videoId } = req.params;
});

const togglePublishStatus = asyncHandlerWP(async (req, res) => {
    const { videoId } = req.params;
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
