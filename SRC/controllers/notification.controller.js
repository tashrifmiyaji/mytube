import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandlerWP } from "../utils/asyncHandler.js";

// Get notifications for the logged-in user (subscriber)
const getNotifications = asyncHandlerWP(async (req, res) => {
    const subscriberId = req.user._id; // Get the logged-in user's ID

    const notification = await Notification.find({ subscriber: subscriberId });

    if (!notification) {
        throw new ApiError(
            500,
            "Something was wrong while fetching the notification!"
        );
    }

    res.status(200).json(
        new ApiResponse(200, notification, "Notifications fetched successful")
    );
});

// Mark notification as read (optional)
const markNotificationAsRead = asyncHandlerWP(async (req, res) => {
    const notificationId = req.params.id; // ID of the notification to mark as read
    const markAsReadNotification = await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
    );
    if (!markAsReadNotification) {
        throw new ApiError(
            500,
            "Something was wrong while updating the notification as read!"
        );
    }
    res.status(200).json(
        new ApiResponse(200, {}, "Notification marked as read")
    );
});
export { getNotifications, markNotificationAsRead };
