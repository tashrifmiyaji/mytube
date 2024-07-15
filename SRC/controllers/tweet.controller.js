import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandlerWP } from "../utils/asyncHandler.js";

const createTweet = asyncHandlerWP(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "content not found!");
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user._id,
    });
    tweet.save();

    if (!tweet) {
        throw new ApiError(500, "internal server error!");
    }

    res.status(201).json(new ApiResponse(200, tweet, "added a new tweet"));
});

const updateTweet = asyncHandlerWP(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "invalid tweet id!");
    }

    if (!content) {
        throw new ApiError(400, "content not found!");
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content,
            },
        },
        { new: true }
    );
    if (!updatedTweet) {
        throw new ApiError(404, "tweet not found!");
    }

    res.status(200).json(
        new ApiResponse(200, updatedTweet, "tweet updated successful")
    );
});

const getUserTweets = asyncHandlerWP(async (req, res) => {
    // TODO: get all tweets of a user
    const allTweets = await Tweet.find({owner: req.user._id});


    if (allTweets.length < 1) {
        throw new ApiError(404, "tweets not found!");
    }

    res.status(200).json(
        new ApiResponse(200, allTweets, "all tweets fetch successful")
    );
});

const deleteTweet = asyncHandlerWP(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "invalid tweet id!");
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

    if (!deletedTweet) {
        throw new ApiError(404, "tweet not found!");
    }

    res.status(200).json(
        new ApiResponse(200, deletedTweet, "this tweet is deleted success!")
    );
});

export { createTweet, updateTweet, getUserTweets, deleteTweet };
