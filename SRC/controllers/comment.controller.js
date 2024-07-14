import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandlerWP } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandlerWP(async (req, res) => {
    // TODO get all comment for a video
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;
});

const addComment = asyncHandlerWP(async (req, res) => {
    // TODO add a comment to a video
    const { videoId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid video id!");
    }

    if (!content) {
        throw new ApiError(400, "content not found!");
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id,
    });
    comment.save();

    res.status(201).json(new ApiResponse(200, comment, "added a new comment"));
});

const updateComment = asyncHandlerWP(async (req, res) => {
    // TODO update a comment
    const { commentId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "invalid comment id!");
    }

    if (!content) {
        throw new ApiError(400, "content not found!");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content,
            },
        },
        { new: true }
    );

    if (!updatedComment) {
        throw new ApiError(404, "can not found comment!");
    }

    res.status(200).json(
        new ApiResponse(200, updatedComment, "comment updated successful")
    );
});

const deleteComment = asyncHandlerWP(async (req, res) => {
    // TODO delete a comment
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "invalid comment id!")
    }

    const isDelete = await Comment.findByIdAndDelete(commentId);
    
    if (!isDelete) {
        throw new ApiError(404, "no comment found!")
    }

    res
    .status(200)
    .json(new ApiResponse(200, isDelete, "delete this comment"))
});

export { getVideoComments, addComment, updateComment, deleteComment };
