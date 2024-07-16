// external inputs
import mongoose, { isValidObjectId } from "mongoose";

// internal imputes
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandlerWP } from "../utils/asyncHandler.js";

//
const toggleVideoLike = asyncHandlerWP(async (req, res) => {
    // TODO toggle like on video
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const likedVideo = await Like.findOne({
        video: videoId,
        likedBy: req.user._id,
    });

    if (likedVideo) {
        await likedVideo.deleteOne();
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "like has been removed!"));
    }

    const addLikeInAVideo = await Like.create({
        video: videoId,
        likedBy: req.user._id,
    });

    if (!addLikeInAVideo) {
        throw new ApiError(500, "like adding problem!");
    }

    res.status(201).json(
        new ApiResponse(200, addLikeInAVideo, "added like in video")
    );
});

const toggleCommentLike = asyncHandlerWP(async (req, res) => {
    // TODO toggle like on comment
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const likeInComment = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id,
    });

    if (likeInComment) {
        await likeInComment.deleteOne();
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "like has been removed"));
    }

    const addLikeInComment = await Like.create({
        comment: commentId,
        likedBy: req.user._id,
    });

    if (!addLikeInComment) {
        throw new ApiError(500, "like adding problem!");
    }

    res.status(201).json(
        new ApiResponse(200, addLikeInComment, "added like in comment")
    );
});

const toggleTweetLike = asyncHandlerWP(async (req, res) => {
    // TODO toggle like on tweet
    const { tweetId } = req.params;

    const likeInTweet = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id,
    });

    if (likeInTweet) {
        await likeInTweet.deleteOne();
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "like has been removed!"));
    }

    const addLikeInTweet = await Like.create({
        tweet: tweetId,
        likedBy: req.user._id,
    });

    res.status(201).json(
        new ApiResponse(200, addLikeInTweet, "added like in tweet")
    );
});

const getLikedVideos = asyncHandlerWP(async (req, res) => {
    // TODO get all liked videos
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
