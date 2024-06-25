// external inputs
import mongoose, { isValidObjectId } from "mongoose";

// internal inputs
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandlerWP } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandlerWP(async (req, res) => {
    const { channelId } = req.params;
    const subscriberId = req.user?._id;

    // Check if the subscriber and channel IDs are valid MongoDB ObjectIDs
    if (!isValidObjectId(channelId) || !isValidObjectId(subscriberId)) {
        throw new ApiError(400, "invalid user or channel!");
    }

    try {
        // Check if the subscription already exists
        let subscription = await Subscription.findOne({
            $and: [{ channel: channelId }, { subscriber: subscriberId }],
        });

        if (subscription) {
            // If subscription exists, remove it (unsubscribe)
            await Subscription.findByIdAndDelete(subscription.id);
            return res
                .status(200)
                .json(new ApiResponse(200, {}, "Unsubscribed successfully"));
        } else {
            // If subscription does not exist, create it (subscribe)
            subscription = await Subscription.create({
                channel: channelId,
                subscriber: subscriberId,
            });
        }
        return res
            .status(201)
            .json(
                new ApiResponse(201, subscription, "Subscribed successfully")
            );
    } catch (error) {
        throw new ApiError(500, "Failed to toggle subscription");
    }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandlerWP(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "invalid channel");
    }

    try {
        // Find all subscriptions where 'channel' matches the channelId
        const subscribers = await Subscription.find({ channel: channelId }).populate(
            "subscriber",
            "fullName username avatar"
        ); // Populate subscriber details from User model
        
        console.log(subscribers);

        res.status(200).json(
            new ApiResponse(
                200,
                subscribers,
                "Channel subscribers fetched successfully"
            )
        );
    } catch (error) {
        throw new ApiError(500, "Failed to fetch channel subscribers");
    }
});

// export
export { toggleSubscription, getUserChannelSubscribers };
