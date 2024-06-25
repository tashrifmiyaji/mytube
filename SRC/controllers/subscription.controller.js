// external inputs
import { isValidObjectId } from "mongoose";

// internal inputs
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandlerWP } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandlerWP(async (req, res) => {
    const subscriberId = req.user?._id;
    const { channelId } = req.params;

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
const getChannelSubscribers = asyncHandlerWP(async (req, res) => {
    // shudu matro user nijei nijer subscriber and subscribed channel er details dekhte parbe
    const channelId = req.user._id;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "invalid channel!");
    }

    try {
        // Find all subscriptions where 'channel' matches the channelId
        let subscribers = await Subscription.find({
            channel: channelId,
        }).populate("subscriber", "fullName username avatar"); // Populate subscriber details from User model

        if (subscribers.length < 1) {
            subscribers = "you have no subscriber!";
        }

        res.status(200).json(
            new ApiResponse(
                200,
                subscribers,
                "Channel subscribers fetched successfully"
            )
        );
    } catch (error) {
        throw new ApiError(500, "Failed to fetch channel subscribers!");
    }
});

const getSubscribedChannels = asyncHandlerWP(async (req, res) => {
    // shudu matro user nijei nijer subscriber and subscribed channel er details dekhte parbe
    const subscriberId = req.user._id;

    // Check if the subscriberId is a valid MongoDB ObjectId
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber Id!");
    }
    try {
        // Find all subscriptions where 'subscriber' matches the subscriberId
        let subscribedChannels = await Subscription.find({
            subscriber: subscriberId,
        }).populate("channel", "fullName username avatar"); // Populate channel details from User model
        
        if (subscribedChannels.length < 1) {
            subscribedChannels = "you have no subscribed channel!"
        }
        
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    subscribedChannels,
                    "Subscribed channels fetched successfully"
                )
            );
    } catch (error) {
        throw new ApiError(500, "Failed to fetch subscribed channels");
    }
});

// export
export { toggleSubscription, getChannelSubscribers, getSubscribedChannels };
