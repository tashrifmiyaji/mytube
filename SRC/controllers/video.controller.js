// external inputs
import mongoose, { isValidObjectId } from "mongoose";

// internal inputs
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandlerWP } from "../utils/asyncHandler.js";
import {
    uploadOnCloudinary,
    deleteCloudinaryImage,
    deleteCloudinaryVideo,
} from "../utils/cloudinary.js";
import {
    notifySubscribers,
    updateNotification,
    deleteNotification,
} from "../Service/notificationService.js";

const getAllVideos = asyncHandlerWP(async (req, res) => {
    //TODO: get all videos based on query, sort, pagination
    const {
        page = 1,
        limit = 10,
        query = "",
        sortBy = "createdAt",
        sortType = 1,
    } = req.query;

    let videoAggregate;

    try {
        videoAggregate = Video.aggregate([
            {
                $match: {
                    $or: [
                        { title: { $regex: query, $options: "i" } },
                        { description: { $regex: query, $options: "i" } },
                    ],
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "videoOwner",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                fullName: 1,
                                username: 1,
                                avatar: 1,
                            },
                        },
                    ],
                },
            },
            {
                $addFields: {
                    owner: {
                        $first: "$videoOwner",
                    },
                },
            },
            {
                $sort: {
                    [sortBy]: sortType,
                },
            },
        ]);
    } catch (error) {
        console.error("Error in aggregation:", error);
        throw new ApiError(
            500,
            error.message || "Internal server error in video aggregation"
        );
    }

    const options = {
        skip: (page - 1) * limit,
        limit: parseInt(limit),
        customLabels: {
            totalDocs: "totalVideos",
            docs: "videos",
        },
    };

    Video.aggregatePaginate(videoAggregate, options)
        .then((result) => {
            if (result?.videos?.length === 0) {
                return res
                    .status(200)
                    .json(new ApiResponse(200, [], "No videos found"));
            }
            return res
                .status(200)
                .json(
                    new ApiResponse(200, result, "video fetched successfully")
                );
        })
        .catch((error) => {
            console.log("error ::", error);
            throw new ApiError(
                500,
                error?.message ||
                    "Internal server error in video aggregate Paginate"
            );
        });
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

    const { title, description, notifyMessage } = req.body;

    if (!title && !description) {
        throw new ApiError(400, "Please provide title and description");
    }

    if (!notifyMessage) {
        throw new ApiError(400, "notify message is required!");
    }

    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "please give proper title and description!");
    }

    const videoFile = req.files?.videoFile[0].path;
    const thumbnailFile = req.files?.thumbnail[0].path;

    if (!(videoFile && thumbnailFile)) {
        throw new ApiError(400, "video or thumbnail is missing!");
    }

    const video = await uploadOnCloudinary(videoFile, "mytube/videos");
    const thumbnail = await uploadOnCloudinary(
        thumbnailFile,
        "mytube/thumbnails"
    );

    if (!(video && thumbnail)) {
        throw new ApiError(500, "video and thumbnail uploading problem!");
    }

    const createVideo = await Video.create({
        videoFile: { public_id: video.public_id, url: video.url },
        thumbnail: { public_id: thumbnail.public_id, url: thumbnail.url },
        title,
        description,
        duration: video.duration,
        owner: req.user._id,
    });
    createVideo.save();

    if (!createVideo) {
        throw new ApiError(500, "internal server error!");
    }

    // Notify the subscribers after the video is uploaded
    const videoDetails = {
        videoId: createVideo._id,
        title,
        url: video.url,
        message: notifyMessage,
    };

    await notifySubscribers(req.user._id, videoDetails);

    res.status(201).json(
        new ApiResponse(200, createVideo, "video uploaded successful")
    );
});

const getVideoById = asyncHandlerWP(async (req, res) => {
    // Todo get video by id
    // get id from params
    // check id is valid
    // find video
    // check if there is video or not
    // send res
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid video id!");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "video not found!");
    }

    res.status(200).json(
        new ApiResponse(200, video, "video fetched successful")
    );
});

const updateVideo = asyncHandlerWP(async (req, res) => {
    //TODO: update video details like title, description, thumbnail
    // get video id from params
    // get title or description or from body
    // get thumbnail with multer
    // check video id is valid or not
    // check whether title or description or thumbnail is empty!
    // find video by video id
    // update title description thumbnail
    // if update thumbnail then delete previous thumbnail from cloudinary
    // upload thumbnail on cloudinary
    // get updated
    // send res
    const { videoId } = req.params;
    const { title, description, notifyMessage } = req.body;
    const thumbnailFile = req.file?.path;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid video id!");
    }

    if (!title && !description && !thumbnailFile) {
        throw new ApiError(
            400,
            "title or description or thumbnail is required for updating!"
        );
    }

    if (!notifyMessage) {
        throw new ApiError(400, "notify message is required for updating!");
    }

    const video = await Video.findById(videoId);

    if (title) {
        video.title = title;
        await video.save({ validateBeforeSave: false });
    }

    if (description) {
        video.description = description;
        await video.save({ validateBeforeSave: false });
    }

    if (thumbnailFile) {
        await deleteCloudinaryImage(video.thumbnail.public_id);
        const thumbnail = await uploadOnCloudinary(
            thumbnailFile,
            "mytube/thumbnails"
        );
        if (!thumbnail) {
            throw new ApiError(500, "thumbnail updating problem!");
        }
        video.thumbnail = {
            public_id: thumbnail.public_id,
            url: thumbnail.url,
        };
        await video.save({ validateBeforeSave: false });
    }

    // update notification
    const videoDetails = {
        videoId: video._id,
        title,
        message: notifyMessage,
    };
    await updateNotification(videoDetails);

    res.status(200).json(
        new ApiResponse(200, video, "video updated successful")
    );
});

const deleteAVideo = asyncHandlerWP(async (req, res) => {
    // TODO: delete video
    // get video id from req.params
    // check id is valid
    //
    // send res
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid video id");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "video has not found!");
    }

    await deleteCloudinaryVideo(video.videoFile.public_id);
    await deleteCloudinaryImage(video.thumbnail.public_id);

    // delete notification of this video
    await deleteNotification(video._id);

    await Video.findByIdAndDelete(video._id);

    res.status(200).json(
        new ApiResponse(200, [], "video has been deleted success")
    );
});

const togglePublishStatus = asyncHandlerWP(async (req, res) => {
    // TODO togglePublishStatus
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid video id!");
    }
    const video = await Video.findById(videoId);

    video.isPublished = !video.isPublished;
    await video.save({ validateBeforeSave: false });

    const videoStatus = { isPublished: video.isPublished };

    res.status(200).json(
        new ApiResponse(200, videoStatus, "video publish status is toggled")
    );
});

const deleteAllVideos = asyncHandlerWP(async (req, res) => {
    // Todo delete all video from a user ( it's my todo )

    const ownerId = req.user._id;

    const allVideos = await Video.find({ owner: ownerId });

    if (allVideos.length < 1) {
        throw new ApiError(404, "any videos has not found!");
    }

    allVideos.map(async (field) => {
        await deleteCloudinaryVideo(field.videoFile.public_id);
        await deleteCloudinaryImage(field.thumbnail.public_id);
    });

    let deletedVideos = await Video.deleteMany({ owner: ownerId });

    deletedVideos.deletedCount = {
        deletedVideoCount: deletedVideos.deletedCount,
    };

    res.status(200).json(
        new ApiResponse(
            200,
            deletedVideos.deletedCount,
            "all videos has been deleted success"
        )
    );
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteAVideo,
    deleteAllVideos,
    togglePublishStatus,
};
