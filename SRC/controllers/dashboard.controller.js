import { asyncHandlerWP } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

const getChannelStats = asyncHandlerWP(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    let data = {};

    const channelStats = await Video.aggregate([
        { $match: { owner: req.user._id } },

        // Lookup for Subscribers of a channel
        {
            $lookup: {
                from: "subscriptions",
                localField: "owner",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        // Lookup for the channel which the owner do Subscribe
        {
            $lookup: {
                from: "subscriptions",
                localField: "owner",
                foreignField: "subscriber",
                as: "subscribedTo",
            },
        },
        // Lookup likes for the user's videos comments and tweets
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likedVideos",
            },
        },

        // Lookup comments for the user's videos
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "videoComments",
            },
        },
        // Lookup tweets by the user
        {
            $lookup: {
                from: "tweets",
                localField: "owner",
                foreignField: "owner",
                as: "allTweets",
            },
        },
        // Group to calculate stats
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" },
                subscribers: { $first: "$subscribers" },
                subscribedTo: { $first: "$subscribedTo" },
                totalComments: { $sum: { $size: "$videoComments" } },
                totalTweets: { $first: { $size: "$allTweets" } },
                totalVideoLikes: { $sum: { $size: "$likedVideos" } },
            },
        },
        // Project the desired fields
        {
            $project: {
                _id: 0,
                totalVideos: 1,
                subscribers: { $size: "$subscribers" },
                subscribedTo: { $size: "$subscribedTo" },
                totalViews: 1,
                totalComments: 1,
                totalTweets: 1,
                totalVideoLikes: 1,
            },
        },
    ]);
    // add channelStats in data
    data = channelStats[0];

    // total comment likes
    const totalCommentLikes = await Comment.aggregate([
        { $match: { owner: req.user._id } },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "commentLikes",
            },
        },
        {
            $group: {
                _id: null,
                totalCommentLikes: { $sum: { $size: "$commentLikes" } },
            },
        },
        {
            $project: {
                _id: 0,
                totalCommentLikes: 1,
            },
        },
    ]);

    // add total comment likes in data
    data.totalCommentLikes = totalCommentLikes[0].totalCommentLikes;

    // total tweet likes
    const totalTweetLikes = await Tweet.aggregate([
        { $match: { owner: req.user._id } },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "tweetLikes",
            },
        },
        {
            $group: {
                _id: null,
                totalTweetLikes: { $sum: { $size: "$tweetLikes" } },
            },
        },
        {
            $project: {
                _id: 0,
                totalTweetLikes: 1,
            },
        },
    ]);

    // add total tweet likes in data
    data.totalTweetLikes = totalTweetLikes[0].totalTweetLikes;

    res.status(200).json(
        new ApiResponse(200, data, "Channel stats fetched successfully")
    );
});

const getChannelVideos = asyncHandlerWP(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const videos = await Video.find({ owner: req.user._id });

    if (!videos[0]) {
        throw new ApiError(200, "no videos found!");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, videos, "Total videos fetched successfully")
        );
});

export { getChannelStats, getChannelVideos };
